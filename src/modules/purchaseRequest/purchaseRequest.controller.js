const { StatusCodes } = require('http-status-codes');
const { PurchaseRequestStatuses } = require('../../utils/enums');
const BaseController = require('../base/BaseController');
const PurchaseRequestService = require('./purchaseRequest.service');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');

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
    async getTodaysRequest(req, res, next) {
        try {
            // Extract organization ID from req.user
            const orgId = req.user.org;  
            // Calculate start and end of today
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0); // Midnight
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999); // End of the day
        
            // Query today's orders for the organization
            const todaysRequests = await this.service.findTodaysRequest({
              org: orgId,
              createdAt: { $gte: startOfDay, $lt: endOfDay },
            });
        
            res.status(StatusCodes.OK).json(new ApiResponse(200, todaysRequests, 'Today\'s Purchase Request retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }

    async createOrder(req, res, next){
        try {
            const raisedBy = req.user.userId;
            req.body.raisedBy = raisedBy
            req.body.org = req.user.org
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
            let {search}=req.query
            if(!search){
                search=""
            }
            const searchResult=await this.service.getInventoryBysearch(search,req.user.org)
            return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK,searchResult, "Inventory Search Result"))
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
