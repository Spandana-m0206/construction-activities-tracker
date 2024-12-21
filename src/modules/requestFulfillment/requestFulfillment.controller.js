const BaseController = require('../base/BaseController');
const RequestFulfillmentService = require('./requestFulfillment.service');

class RequestFulfillmentController extends BaseController {
    constructor() {
        super(RequestFulfillmentService); // Pass the RequestFulfillmentService to the BaseController
    }

    // Example custom controller method: Get fulfillments by order ID
    async getFulfillmentsByOrder(req, res, next) {
        try {
            const fulfillments = await this.service.findFulfillmentsByOrder(req.params.orderId);
            res.status(200).json({ success: true, data: fulfillments });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new RequestFulfillmentController();
