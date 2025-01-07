const BaseController = require('../base/BaseController');
const requestFulfillmentService = require('./requestFulfillment.service');
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
    async dispatchMaterials (req, res, next){
        try {
            const fulfillment = await requestFulfillmentService.createFulfillment(req.body);
            res.status(200).json({ success: true, data: fulfillment });
        } catch (error) {
            next(error);
        }
    };
    async acknowledgeReceipt (req, res, next) {
        try {
            const { id } = req.params;
            const { receivedBy, receivedOn } = req.body;
            const fulfilledOn = new Date();
            const fulfillment = await requestFulfillmentService.acknowledgeReceipt(id, { receivedBy, receivedOn, fulfilledOn});
    
            res.status(200).json({ success: true, data: fulfillment });
        } catch (error) {
            next(error);

        }
    };
    
}

module.exports = new RequestFulfillmentController();
