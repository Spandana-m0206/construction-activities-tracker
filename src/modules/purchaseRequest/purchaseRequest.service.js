const BaseService = require('../base/BaseService');
const PurchaseRequest = require('./purchaseRequest.model');

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
}

module.exports = new PurchaseRequestService();
