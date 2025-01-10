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
    async createPurchase(req, res, next) {
        try {
            const { purchaseRequestIds, vendorId, amount, attachment, purchasedBy } = req.body;

            if (!purchaseRequestIds || purchaseRequestIds.length === 0) {
                throw new Error('No purchase request IDs provided');
            }
            if (!vendorId || !amount || !attachment || !purchasedBy) {
                throw new Error('Missing required fields for purchase');
            }

            const purchase = await this.service.createPurchase({
                purchaseRequestIds,
                vendorId,
                amount,
                attachment,
                purchasedBy,
                org: req.user.org,
            });

            res.status(200).json({
                success: true,
                data: purchase,
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PurchaseController();
