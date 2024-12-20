const BaseController = require('../base/BaseController');
const PaymentRequestService = require('./paymentRequest.service');

class PaymentRequestController extends BaseController {
    constructor() {
        super(PaymentRequestService); // Pass the PaymentRequestService to the BaseController
    }

    // Example custom controller method: Get payment requests by user
    async getPaymentRequestsByUser(req, res, next) {
        try {
            const paymentRequests = await this.service.findPaymentRequestsByUser(req.params.userId);
            res.status(200).json({ success: true, data: paymentRequests });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PaymentRequestController();
