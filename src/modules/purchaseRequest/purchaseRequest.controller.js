const { PurchaseRequestStatuses } = require('../../utils/enums');
const BaseController = require('../base/BaseController');
const PurchaseRequestService = require('./purchaseRequest.service');

class PurchaseRequestController extends BaseController {
    constructor() {
        super(PurchaseRequestService); // Pass the PurchaseRequestService to the BaseController
    }

    // Example custom controller method: Get purchase requests by inventory
    async getRequestsByInventory(req, res, next) {
        try {
            const requests = await this.service.findRequestsByInventory(req.params.inventoryId);
            res.status(200).json({ success: true, data: requests });
        } catch (error) {
            next(error);
        }
    }

    async consolidateMaterials(req, res, next) {
        try {
            const { purchaseRequestIds } = req.body;
            const consolidatedMaterials =
                await PurchaseRequestService.consolidateMaterials(purchaseRequestIds);
            res.status(200).json({ success: true, data: consolidatedMaterials });
        } catch (error) {
            next(error);
        }
    }

    async createPurchase(req, res, next) {
        try {
            const { purchaseRequestIds, purchasedBy, amount, vendor, attachment } =
                req.body;
            const purchase = await PurchaseRequestService.createPurchase({
                purchaseRequestIds,
                purchasedBy: req.user,
                amount,
                vendor,
                attachment,
            });
            res.status(200).json({ success: true, data: purchase });
        } catch (error) {
            next(error);
        }
    }

    async markReceived(req, res, next) {
        try {
            const { purchaseRequestFulfillmentId, receivedBy } = req.body;
            const fulfillment = await PurchaseRequestService.markReceived(
                purchaseRequestFulfillmentId,
                { receivedBy: req.user._id },
            );
            res.status(200).json({ success: true, data: fulfillment });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PurchaseRequestController();
