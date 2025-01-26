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
      
            await stockService.findOneAndUpdate(
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
      
        // Step 5: Mark the current Fulfillment as `RECEIVED`
        fulfillment.status = FulfillmentStatuses.RECEIVED;
        fulfillment.receivedBy = receivedBy;
        fulfillment.receivedOn = new Date();
        await fulfillment.save();
      
        // Step 6: Re-check overall fulfillment across *all* received fulfillments
        const allFulfillments = await PurchaseRequestFulfillmentModel.find({
          purchaseRequest: purchaseRequest._id,
          status: FulfillmentStatuses.RECEIVED, // Only count what has actually been received
        }).populate('materialFulfilled');
      
        let isFullyFulfilled = true;
      
        // For each requested material, sum the total fulfilled quantity across all *received* fulfillments
        for (const reqMaterialObj of purchaseRequest.materialList) {
          const requestMaterialId = reqMaterialObj.material._id
            ? reqMaterialObj.material._id.toString()
            : reqMaterialObj.material.toString();
      
          const totalFulfilledQuantity = allFulfillments.reduce((acc, f) => {
            const matchedMaterial = f.materialFulfilled.find(
              (m) => m.material.toString() === requestMaterialId,
            );
            return matchedMaterial ? acc + matchedMaterial.quantity : acc;
          }, 0);
      
          // If the total fulfilled is less than requested for any material, it's not fully complete
          if (totalFulfilledQuantity < reqMaterialObj.qty) {
            isFullyFulfilled = false;
            break;
          }
        }
      
        // Update the PurchaseRequest status
        purchaseRequest.status = isFullyFulfilled
          ? PurchaseRequestStatuses.COMPLETED
          : PurchaseRequestStatuses.PARTIALLY_FULFILLED;
      
        // Save the PurchaseRequest changes
        await purchaseRequest.save();
      
        return {
          fulfillment,
          purchaseRequest,
        };
      }
      
    
}

module.exports = new PurchaseRequestFulfillmentService();
