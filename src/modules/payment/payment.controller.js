const BaseController = require('../base/BaseController');
const PaymentService = require('./payment.service');

class PaymentController extends BaseController {
    constructor() {
        super(PaymentService); // Pass the PaymentService to the BaseController
    }

    // Example custom controller method: Get payments by organization
    async getPaymentsByOrg(req, res, next) {
        try {
            const payments = await this.service.findPaymentsByOrg(req.params.orgId);
            res.status(200).json({ success: true, data: payments });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PaymentController();
