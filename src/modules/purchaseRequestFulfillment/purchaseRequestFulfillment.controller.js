const BaseController = require('../base/BaseController');
const PurchaseRequestFulfillmentService = require('./purchaseRequestFulfillment.service');

class PurchaseRequestFulfillmentController extends BaseController {
    constructor() {
        super(PurchaseRequestFulfillmentService); // Pass the service to the BaseController
    }

    // Example custom controller method: Get fulfillments by status
    async getFulfillmentsByStatus(req, res, next) {
        try {
            const fulfillments = await this.service.findFulfillmentsByStatus(req.params.status);
            res.status(200).json({ success: true, data: fulfillments });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PurchaseRequestFulfillmentController();
