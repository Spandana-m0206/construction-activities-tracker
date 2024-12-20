const BaseService = require('../base/BaseService');
const RequestFulfillment = require('./requestFulfillment.model');

class RequestFulfillmentService extends BaseService {
    constructor() {
        super(RequestFulfillment); // Pass the Request Fulfillment model to the BaseService
    }

    // Example custom service method: Get fulfillments by order ID
    async findFulfillmentsByOrder(orderId) {
        return await this.model.model.find({ orderId })
            .populate('materialList', 'name category')
            .populate('fulfilledBy', 'name email')
            .populate('receivedBy', 'name email')
            .populate('transferredFrom', 'name location')
            .populate('transferredTo', 'name location');
    }
}

module.exports = new RequestFulfillmentService();
