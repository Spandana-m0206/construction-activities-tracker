const BaseService = require('../base/BaseService');
const PurchaseRequestFulfillment = require('./purchaseRequestFulfillment.model');

class PurchaseRequestFulfillmentService extends BaseService {
    constructor() {
        super(PurchaseRequestFulfillment); // Pass the model to the BaseService
    }

    // Example custom service method: Get fulfillments by status
    async findFulfillmentsByStatus(status) {
        return await this.model.model.find({ status })
            .populate('purchaseRequest', 'id')
            .populate('materialFulfilled.material', 'name category')
            .populate('fulfilledBy', 'name email')
            .populate('receivedBy', 'name email');
    }
}

module.exports = new PurchaseRequestFulfillmentService();
