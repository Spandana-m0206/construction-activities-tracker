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

    async getConsolidatedOrderDetails(req, res, next){
        try {
            const orders = await PurchaseRequestService.getConsolidatedOrderDetails(req.params.inventoryId);
            res.status(200).json({ success: true, data: orders });
        } catch (error) {
            next(next);
        }
    }

    async getDetailedPurchaseRequest(req, res, next){
        try {
            const orders = await PurchaseRequestService.getDetailedPurchaseRequest(req.params.purchaseRequestId);
            res.status(200).json({ success: true, data: orders });
        } catch (error) {
            next(next);
        }
    }

    async createOrder(req, res, next){
        try {
            const raisedBy = req.user.userId;
            req.body.raisedBy = raisedBy
            const orders = await this.service.create(req.body);
            res.status(200).json({ success: true, data: orders });
        } catch (error) {
            next(next);
        }
    }
}

module.exports = new PurchaseRequestController();
