const BaseController = require('../base/BaseController');
const VendorService = require('./vendor.service');

class VendorController extends BaseController {
    constructor() {
        super(VendorService); // Pass the VendorService to the BaseController
    }

    // Example custom controller method: Get vendors by organization
    async getVendorsByOrg(req, res, next) {
        try {
            const vendors = await this.service.findVendorsByOrg(req.params.orgId);
            res.status(200).json({ success: true, data: vendors });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new VendorController();
