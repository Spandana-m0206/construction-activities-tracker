const BaseService = require('../base/BaseService');
const Vendor = require('./vendor.model');

class VendorService extends BaseService {
    constructor() {
        super(Vendor); // Pass the Vendor model to the BaseService
    }

    // Example custom service method: Get vendors by organization
    async findVendorsByOrg(orgId) {
        return await this.model.model.find({ org: orgId }).populate('createdBy', 'name email');
    }
}

module.exports = new VendorService();
