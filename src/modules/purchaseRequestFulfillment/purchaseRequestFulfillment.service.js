const {
    StockSources,
    PurchaseRequestStatuses,
    FulfillmentStatuses,
} = require('../../utils/enums');
const BaseService = require('../base/BaseService');
const PurchaseModel = require('../purchase/purchase.model');
const purchaseService = require('../purchase/purchase.service');
const PurchaseRequestModel = require('../purchaseRequest/purchaseRequest.model');
const stockService = require('../stock/stock.service');
const PurchaseRequestFulfillmentModel = require('./purchaseRequestFulfillment.model');
const PurchaseRequestFulfillment = require('./purchaseRequestFulfillment.model');

class PurchaseRequestFulfillmentService extends BaseService {
    constructor() {
        super(PurchaseRequestFulfillment); // Pass the model to the BaseService
    }

    // Example custom service method: Get fulfillments by status
    async findFulfillmentsByStatus(status) {
        return await this.model.model
            .find({ status })
            .populate('purchaseRequest', 'id')
            .populate('materialFulfilled.material', 'name category')
            .populate('fulfilledBy', 'name email')
            .populate('receivedBy', 'name email');
    }
    // --------------------------------------------------------------------------
    // 3. MARK PURCHASE AS RECEIVED (Stock Model uses "material" array of MLI refs)
    //    a) Populate purchase’s materialListItems
    //    b) For each item, push the item._id into Stock model's "material" array
    // --------------------------------------------------------------------------
    async markPurchaseAsReceived(purchaseFulfillmentId, receivedBy) {
        // Step 1: Fetch the PurchaseRequestFulfillment
        const fulfillment = await PurchaseRequestFulfillmentModel.findById(
            purchaseFulfillmentId,
        ).populate('materialFulfilled');
        if (!fulfillment) {
            throw new Error('PurchaseRequestFulfillment not found');
        }

        // Step 2: Fetch the associated PurchaseRequest
        const purchaseRequest = await PurchaseRequestModel.findById(
            fulfillment.purchaseRequest,
        ).populate('materialList.material');
        if (!purchaseRequest) {
            throw new Error('PurchaseRequest not found for the fulfillment');
        }

        // Step 3: Fetch the associated Purchase
        const purchase = await PurchaseModel.findOne({
            purchaseRequests: purchaseRequest._id,
        }).populate('materialListItems');
        if (!purchase) {
            throw new Error('Purchase not found for the PurchaseRequest');
        }

        // Step 4: Update Stock
        const targetInventory = purchaseRequest.inventory || null; // Determine inventory or site

        await Promise.all(
            fulfillment.materialFulfilled.map(async (fulfilledMaterial) => {
                // Find the corresponding MaterialListItem in the Purchase
                const materialListItem = purchase.materialListItems.find(
                    (item) =>
                        item.materialMetadata.toString() ===
                        fulfilledMaterial.material.toString(),
                );

                if (!materialListItem) {
                    console.error(
                        `MaterialListItem not found for fulfilled material: ${fulfilledMaterial.material}`,
                    );
                    throw new Error(
                        `MaterialListItem not found for fulfilled material: ${fulfilledMaterial.material}`,
                    );
                }
                // Create or update Stock and add MaterialListItem reference
                const updateData = targetInventory
                    ? { inventory: targetInventory, source: 'inventory' }
                    : { site: purchaseRequest.site, source: 'site' };

                const stockUpdate = {
                    $push: { material: materialListItem._id }, // Add MaterialListItem reference
                };

                const updatedStock = await stockService.findOneAndUpdate(
                    {
                        org: materialListItem.org, // Organization ID
                        materialMetaData: materialListItem.materialMetadata,
                        ...updateData,
                    },
                    stockUpdate,
                    { upsert: true, new: true }, // Upsert logic ensures stock is created or updated
                );
            }),
        );

        // Step 5: Update Fulfillment Status
        const allMaterialsReceived = fulfillment.materialFulfilled.every(
            (fulfilledItem) => {
                // Extract request material for comparison
                const requestMaterial = purchaseRequest.materialList.find(
                    (reqMaterial) => {
                        const requestMaterialId = reqMaterial.material._id
                            ? reqMaterial.material._id.toString() // Extract _id if populated
                            : reqMaterial.material.toString(); // Use ObjectId directly if not populated
                        const isMatch =
                            requestMaterialId ===
                            fulfilledItem.material.toString();

                        return isMatch;
                    },
                );

                if (!requestMaterial) {
                    console.error(
                        `Material in fulfillment not found in PurchaseRequest - Fulfilled Material: ${fulfilledItem.material}`,
                    );
                    return false; // Material not found
                }

                if (fulfilledItem.quantity > requestMaterial.qty) {
                    console.error(
                        `Fulfilled quantity (${fulfilledItem.quantity}) exceeds requested quantity (${requestMaterial.qty}) for material: ${fulfilledItem.material}`,
                    );
                    return false; // Invalid case: Overfulfillment
                }

                if (fulfilledItem.quantity === requestMaterial.qty) {
                    return true; // Fully fulfilled
                } else {
                    return false; // Partially fulfilled
                }
            },
        );

        if (allMaterialsReceived) {
            console.log('All materials fulfilled, marking as COMPLETED');
            purchaseRequest.status = PurchaseRequestStatuses.COMPLETED;
            fulfillment.status = FulfillmentStatuses.RECEIVED;
        } else {
            console.log(
                'Some materials not fulfilled, marking as PARTIALLY_FULFILLED',
            );
            purchaseRequest.status =
                PurchaseRequestStatuses.PARTIALLY_FULFILLED;
            fulfillment.status = FulfillmentStatuses.PARTIALLY_FULFILLED;
        }

        // Mark the fulfillment as received
        fulfillment.receivedBy = receivedBy;
        fulfillment.receivedOn = new Date();
        await fulfillment.save();

        // Step 6: Save PurchaseRequest Status
        await purchaseRequest.save();

        return {
            fulfillment,
            purchaseRequest,
        };
    }
}

module.exports = new PurchaseRequestFulfillmentService();
