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
    
                const data = await PurchaseRequestService.getConsolidatedMaterials(purchaseRequestIds);
                return res.status(200).json({ success: true, data });
            } catch (error) {
                next(error);
            }
        }
}

module.exports = new PurchaseRequestController();
