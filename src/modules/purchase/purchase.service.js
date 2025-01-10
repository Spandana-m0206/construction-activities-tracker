const BaseService = require('../base/BaseService');
const purchaseRequestService = require('../purchaseRequest/purchaseRequest.service');
const purchaseRequestFulfillmentService = require('../purchaseRequestFulfillment/purchaseRequestFulfillment.service');
const Purchase = require('./purchase.model');

class PurchaseService extends BaseService {
    constructor() {
        super(Purchase); // Pass the Purchase model to the BaseService
    }

    // Example custom service method: Get purchases by vendor
    async findPurchasesByVendor(vendorId) {
        return await this.model.model.find({ vendor: vendorId })
            .populate('purchasedBy', 'name email')
            .populate('vendor', 'name contact')
            .populate('attachment', 'filename url')
            .populate('approvedBy', 'name email')
            .populate('payments', 'id amount status');
    }
    async createPurchase(data) {
        const { purchasedBy, vendor, amount, attachment, approvedBy, purchaseRequestIds } = data;
    
        // Step 1: Consolidate Materials
        const consolidatedMaterials = await this.consolidateMaterials(purchaseRequestIds);
    
        // Step 2: Create MaterialListItems for Purchase
        const materialListItems = await Promise.all(
            consolidatedMaterials.map(material =>
                materialListItemsService.create({
                    material: material.material,
                    qty: material.currentQtyRequired,
                    price: 0, // Add pricing logic
                    org: data.org
                })
            )
        );
    
        // Step 3: Create Purchase
        const purchase = await PurchaseService.create({
            purchasedBy,
            amount,
            vendor,
            attachment,
            approvedBy,
            payments: [],
        });
    
        // Step 4: Create Fulfillments
        for (const requestId of purchaseRequestIds) {
            const request = await purchaseRequestService.findById(requestId);
            const fulfillments = [];
    
            for (const material of request.materialList) {
                const consolidatedMaterial = consolidatedMaterials.find(
                    m => m.material === material.material.toString()
                );
    
                const fulfilledQty = Math.min(
                    material.qty - request.alreadyFulfilled,
                    consolidatedMaterial.currentQtyRequired
                );
    
                if (fulfilledQty > 0) {
                    fulfillments.push({
                        material: material.material,
                        quantity: fulfilledQty
                    });
                    consolidatedMaterial.currentQtyRequired -= fulfilledQty;
                }
            }
    
            await purchaseRequestFulfillmentService.create({
                purchaseRequest: requestId,
                materialFulfilled: fulfillments,
                fulfilledBy: purchasedBy,
                fulfilledOn: new Date(),
                status: FulfillmentStatuses.IN_PROGRESS,
            });
        }
    
        return purchase;
    }
    async acknowledgePurchase(purchaseId, data) {
        const { receivedBy, materialsReceived } = data;
    
        for (const material of materialsReceived) {
            const stockQuery = { material: material.material };
            const stock = await StockModel.findOne(stockQuery);
    
            if (stock) {
                stock.quantity += material.quantity;
            } else {
                await StockModel.create({
                    material: material.material,
                    inventory: purchase.inventory,
                    qty: material.quantity
                });
            }
    
            await stock.save();
        }
    
        return { success: true };
    }    
}

module.exports = new PurchaseService();
