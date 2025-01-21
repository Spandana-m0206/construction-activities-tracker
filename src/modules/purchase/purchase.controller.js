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

    /**
     * 2) Create a Purchase for the specified Purchase Requests
     *    - Accepts purchaseRequestIds, vendor, purchasedBy, amount, attachment, org
     *    - Creates MaterialListItems, Purchase, and PurchaseRequestFulfillments
     */
    async createPurchase(req, res, next) {
        try {
            const {
                purchaseRequests,
                purchaseRequestIds,
                vendor,
                amount,
                attachment,
            } = req.body;

            if (!purchaseRequestIds || !purchaseRequestIds.length) {
                return res.status(400).json({
                    success: false,
                    message: 'purchaseRequestIds array is required',
                });
            }

            const newPurchase = await this.service.createPurchase({
                purchaseRequestIds,
                materialsList:purchaseRequests,
                vendor,
                purchasedBy:req.user.userId,
                amount,
                attachment,
                org: req.user.org,
            });

            return res.status(201).json({ success: true, data: newPurchase });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PurchaseController();
