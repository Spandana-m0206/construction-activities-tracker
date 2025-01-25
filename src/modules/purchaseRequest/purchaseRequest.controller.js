const { StatusCodes } = require('http-status-codes');
const { PurchaseRequestStatuses } = require('../../utils/enums');
const BaseController = require('../base/BaseController');
const PurchaseRequestService = require('./purchaseRequest.service');
const ApiResponse = require('../../utils/apiResponse');

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
            return res.status(200).json(new ApiResponse(StatusCodes.OK, data, "Consolidated Material List Fetched"));
        } catch (error) {
            next(error);
        }
    }

    async find (req, res) {
        try {
            const {search}=req.query
            if(!search){
                search=""
            }
            const searchResult=await this.service.getInventoryBysearch(search,req.user.org)
            return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK,{searchResult}, "Inventory Search Result"))
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR,"Something Went Wrong",error))   
        
    }
    }

    async create(req, res) {
        const newRequest = await this.service.create({...req.body, org: req.user.org, raisedBy: req.user.userId});
        return res.status(StatusCodes.CREATED).json(new ApiResponse(StatusCodes.CREATED, newRequest, "Purchase request created successfully"));
    }
   }

module.exports = new PurchaseRequestController();
