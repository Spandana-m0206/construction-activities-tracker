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
}

module.exports = new PurchaseRequestController();
