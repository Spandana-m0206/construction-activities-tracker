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
        /**
     * 3) Mark an existing Purchase as received
     *    - Accepts purchaseId (path param), receivedBy in the body
     *    - Updates the Purchase to mark it as received and increments stock
     */
        async markPurchaseAsReceived(req, res, next) {
            try {
                const { id } = req.params;          // purchaseId from URL
                const { receivedBy } = req.body;    // user ID who receives
    
                if (!id) {
                    return res.status(400).json({
                        success: false,
                        message: 'purchaseId is required',
                    });
                }
                if (!receivedBy) {
                    return res.status(400).json({
                        success: false,
                        message: 'receivedBy is required',
                    });
                }
    
                const updatedPurchase = await PurchaseRequestFulfillmentService.markPurchaseAsReceived(id, receivedBy);
    
                return res.status(200).json({
                    success: true,
                    data: updatedPurchase,
                });
            } catch (error) {
                next(error);
            }
        }
}

module.exports = new PurchaseRequestFulfillmentController();
