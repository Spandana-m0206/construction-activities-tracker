const BaseService = require('../base/BaseService');
const PurchaseRequestModel = require('./purchaseRequest.model');
const PurchaseRequest = require('./purchaseRequest.model');
const materialListItemService = require('../materialListItem/materialListItem.service');
const purchaseService = require('../purchase/purchase.service');
const purchaseRequestFulfillmentService = require('../purchaseRequestFulfillment/purchaseRequestFulfillment.service');

class PurchaseRequestService extends BaseService {
    constructor() {
        super(PurchaseRequest); // Pass the Purchase Request model to the BaseService
    }

    // Example custom service method: Get purchase requests by inventory
    async findRequestsByInventory(inventoryId) {
        return await this.model.model.find({ inventory: inventoryId })
            .populate('raisedBy', 'name email')
            .populate('approvedBy', 'name email')
            .populate('materialList.material', 'name category');
    }

    async consolidateMaterials(purchaseRequestIds) {
        const purchaseRequests = await PurchaseRequestModel.find({
            _id: { $in: purchaseRequestIds },
        })
            .sort({ priority: 1, createdAt: 1 }) // Sort by priority and creation date
            .populate('materialList.material');

        if (!purchaseRequests.length) {
            throw new Error('No purchase requests found');
        }

        const consolidatedMaterials = {};

        for (const request of purchaseRequests) {
            for (const item of request.materialList) {
                const materialId = item.material.toString();
                if (!consolidatedMaterials[materialId]) {
                    consolidatedMaterials[materialId] = {
                        material: item.material,
                        totalRequired: 0,
                        alreadyFulfilled: 0,
                        purchaseRequests: [],
                    };
                }
                console.log(item.qty)
                consolidatedMaterials[materialId].totalRequired += item.qty;
                consolidatedMaterials[materialId].purchaseRequests.push({
                    purchaseRequestId: request._id,
                    requiredQty: item.qty,
                });
            }
        }

        return Object.values(consolidatedMaterials);
    }

    // Create a new purchase and fulfill purchase requests
    async createPurchase({ purchaseRequestIds, purchasedBy, amount, vendor, attachment }) {
        const consolidatedMaterials = await this.consolidateMaterials(
            purchaseRequestIds,
        );
        
        const materialListItems = [];
        const purchaseRequestFulfillments = [];

        for (const material of consolidatedMaterials) {
            let remainingQty = material.totalRequired - material.alreadyFulfilled;

            for (const request of material.purchaseRequests) {
                if (remainingQty <= 0) break;

                const fulfillQty = Math.min(
                    remainingQty,
                    request.requiredQty - material.alreadyFulfilled,
                );
                if (fulfillQty <= 0) continue;

                // Create Material List Item
                const materialListItem = await materialListItemService.create({
                    materialMetadata: material.material._id,
                    qty: fulfillQty,
                    price: 0, // Update this with the actual purchase price
                    org: purchasedBy.org,
                });

                materialListItems.push(materialListItem._id);

                // Track Purchase Request Fulfillment
                purchaseRequestFulfillments.push({
                    purchaseRequest: request.purchaseRequestId,
                    materialFulfilled: [
                        { material: material.material._id, quantity: fulfillQty },
                    ],
                });

                remainingQty -= fulfillQty;
            }
        }

        // Create Purchase
        const purchase = await purchaseService.create({
            purchasedBy,
            amount,
            vendor,
            attachment,
            approvedBy: null, // Add approval logic if needed
            payments: [],
        });

        // Create Purchase Request Fulfillments
        await purchaseRequestFulfillmentService.insertMany(
            purchaseRequestFulfillments.map((fulfillment) => ({
                ...fulfillment,
                fulfilledBy: purchasedBy,
                fulfilledOn: new Date(),
                status: 'in progress',
            })),
        );

        return { purchase, materialListItems, purchaseRequestFulfillments };
    }

    // Mark materials as received and update stock
    async markReceived(purchaseRequestFulfillmentId, { receivedBy }) {
        const fulfillment = await PurchaseRequestFulfillmentModel.findById(
            purchaseRequestFulfillmentId,
        ).populate('materialFulfilled.material');

        if (!fulfillment) {
            throw new Error('Purchase Request Fulfillment not found');
        }

        fulfillment.status = 'received';
        fulfillment.receivedBy = receivedBy;
        fulfillment.receivedOn = new Date();

        // Update Stock
        for (const item of fulfillment.materialFulfilled) {
            const stock = await StockModel.findOneAndUpdate(
                {
                    materialMetaData: item.material._id,
                    inventory: fulfillment.purchaseRequest.inventory,
                },
                { $inc: { quantity: item.quantity } },
                { new: true, upsert: true },
            );

            if (!stock) {
                throw new Error(
                    `Failed to update stock for material ${item.material.name}`,
                );
            }
        }

        await fulfillment.save();
        return fulfillment;
    }
}

module.exports = new PurchaseRequestService();
