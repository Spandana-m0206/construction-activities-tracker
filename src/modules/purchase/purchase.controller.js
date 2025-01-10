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
     * 1) Get consolidated materials for multiple Purchase Requests
     *    - Accepts an array of purchaseRequestIds
     *    - Returns an array of { material, qty } objects
     */
    async getConsolidatedMaterials(req, res, next) {
        try {
            // You can pass IDs as req.body or req.query
            // Assuming it's in req.body for a POST request (or use req.query for GET)
            const { purchaseRequestIds } = req.body;
            if (!purchaseRequestIds || !purchaseRequestIds.length) {
                return res.status(400).json({
                    success: false,
                    message: 'purchaseRequestIds are required',
                });
            }

            const data = await PurchaseService.getConsolidatedMaterials(purchaseRequestIds);
            return res.status(200).json({ success: true, data });
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
                purchaseRequestIds,
                vendor,
                purchasedBy,
                amount,
                attachment,
            } = req.body;

            if (!purchaseRequestIds || !purchaseRequestIds.length) {
                return res.status(400).json({
                    success: false,
                    message: 'purchaseRequestIds array is required',
                });
            }

            const newPurchase = await PurchaseService.createPurchase({
                purchaseRequestIds,
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

    /**
     * 3) Mark an existing Purchase as received
     *    - Accepts purchaseId (path param), receivedBy in the body
     *    - Updates the Purchase to mark it as received and increments stock
     */
    async markPurchaseAsReceived(req, res, next) {
        try {
            const { id } = req.params;          // purchaseId from URL
            const { receivedBy } = req.body;    // user ID who receives

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'purchaseId is required',
                });
            }
            if (!receivedBy) {
                return res.status(400).json({
                    success: false,
                    message: 'receivedBy is required',
                });
            }

            const updatedPurchase = await PurchaseService.markPurchaseAsReceived(id, receivedBy);

            return res.status(200).json({
                success: true,
                data: updatedPurchase,
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PurchaseController();
