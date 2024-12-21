const BaseService = require('../base/BaseService');
const Purchase = require('./purchase.model');

class PurchaseService extends BaseService {
    constructor() {
        super(Purchase); // Pass the Purchase model to the BaseService
    }

    // Example custom service method: Get purchases by vendor
    async findPurchasesByVendor(vendorId) {
        return await this.model.model.find({ vendor: vendorId })
            .populate('purchasedBy', 'name email')
            .populate('vendor', 'name contact')
            .populate('attachment', 'filename url')
            .populate('approvedBy', 'name email')
            .populate('payments', 'id amount status');
    }
}

module.exports = new PurchaseService();
