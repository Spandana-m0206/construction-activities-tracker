const BaseService = require('../base/BaseService');
const Payment = require('./payment.model');

class PaymentService extends BaseService {
    constructor() {
        super(Payment); // Pass the Payment model to the BaseService
    }

    // Example custom service method: Get payments by organization
    async findPaymentsByOrg(orgId) {
        return await this.model.model.find({ org: orgId })
            .populate('createdBy', 'name email')
            .populate('approvedBy', 'name email')
            .populate('site', 'name location')
            .populate('inventory', 'name address')
            .populate('inventoryRequest.material', 'name category')
            .populate('vendor', 'name address');
    }
}

module.exports = new PaymentService();
