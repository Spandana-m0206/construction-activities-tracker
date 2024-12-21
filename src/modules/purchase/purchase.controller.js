const BaseController = require('../base/BaseController');
const PurchaseService = require('./purchase.service');

class PurchaseController extends BaseController {
    constructor() {
        super(PurchaseService); // Pass the PurchaseService to the BaseController
    }

    // Example custom controller method: Get purchases by vendor
    async getPurchasesByVendor(req, res, next) {
        try {
            const purchases = await this.service.findPurchasesByVendor(req.params.vendorId);
            res.status(200).json({ success: true, data: purchases });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PurchaseController();
