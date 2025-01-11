const BaseService = require('../base/BaseService');
const PaymentRequest = require('./paymentRequest.model');

class PaymentRequestService extends BaseService {
    constructor() {
        super(PaymentRequest); // Pass the Payment Request model to the BaseService
    }

    // Example custom service method: Get payment requests by user
    async findPaymentRequestsByUser(userId) {
        return await this.model.model.find({ raisedBy: userId })
            .populate('raisedBy', 'name email')
            .populate('approvedBy', 'name email')
            .populate('attachments', 'filename url')
            .populate('task', 'title status')
            .populate('payments', 'id amount status');
    }
  
}

module.exports = new PaymentRequestService();
