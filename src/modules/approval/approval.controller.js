const ApiError = require('../../utils/apiError');
const { ApprovalStatuses, ApprovalTypes, Roles } = require('../../utils/enums');
const enumToArray = require('../../utils/EnumToArray');
const BaseController = require('../base/BaseController');
const ApprovalService = require('./approval.service');
const { StatusCodes } = require("http-status-codes");
const ApiResponse = require('../../utils/apiResponse');
class ApprovalController extends BaseController {
    constructor() {
        super(ApprovalService); // Pass the ApprovalService to the BaseController
    }

    async create(req, res, next) {
        try {
            const approvalData = req.body;
            const user= req.user;
            if(!approvalData.task || !approvalData.site || !approvalData.approvedBy || !approvalData.images || !approvalData.status || !approvalData.type) {
                return res.status(StatusCodes.BAD_REQUEST).json(new ApiError(StatusCodes.BAD_REQUEST,'Please fill all required fields' ));
            } 
            if(!enumToArray(ApprovalStatuses).includes(approvalData.status)) {
                return res.status(StatusCodes.BAD_REQUEST).json(new ApiError(StatusCodes.BAD_REQUEST,'Invalid Approval status' ));
            }
            if(!enumToArray(ApprovalTypes).includes(approvalData.type)) {
                return res.status(StatusCodes.BAD_REQUEST).json(new ApiError(StatusCodes.BAD_REQUEST,'Invalid Approval type' ));
            }
            if(user.role !== Roles.ADMIN && user.role !== Roles.SITE_SUPERVISOR){ 
                return res.status(StatusCodes.BAD_REQUEST).json(new ApiError(StatusCodes.BAD_REQUEST,'You are not authorized to create approvals' ));
            }
            approvalData.org = user.org;

            const data = await this.service.create(approvalData);
            res.status(StatusCodes.CREATED).json(new ApiResponse(StatusCodes.CREATED, data, 'Approval created successfully'));
        } catch (error) {
            next(error);
        }
    }
    async find(req, res, next) {
        try {
            const user= req.user;

            if(user.role !== Roles.ADMIN && user.role !== Roles.SITE_SUPERVISOR){ 
                return res.status(StatusCodes.BAD_REQUEST).json(new ApiError(StatusCodes.BAD_REQUEST,'You are not authorized to view approvals' ));
            }
            // Extract filters from query parameters
            const filters = { org: user.org };
            if (req.query.status) {
                filters.status = req.query.status;
            }
            if (req.query.type) {
                filters.type = req.query.type;
            }
            const data = await this.service.find(filters);
            res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, data, 'Approvals retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }
    async findOne(req, res, next) {
        try {
            const user= req.user;
            if(user.role !== Roles.ADMIN && user.role !== Roles.SITE_SUPERVISOR){ 
                return res.status(StatusCodes.BAD_REQUEST).json(new ApiError(StatusCodes.BAD_REQUEST,'You are not authorized to view approvals' ));
            }
            const filter = { _id: req.params.id, org: user.org };
            const data = await this.service.find(filter);
            res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, data, 'Approval retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }

    async update (req, res, next) {
        try {
            const approvalData = req.body;
            const user= req.user;

            if(approvalData.status && !enumToArray(ApprovalStatuses).includes(approvalData.status)) {
                return res.status(StatusCodes.BAD_REQUEST).json(new ApiError(StatusCodes.BAD_REQUEST,'Invalid Approval Status' ));
            }
            if(approvalData.type && !enumToArray(ApprovalTypes).includes(approvalData.type)) {
                return res.status(StatusCodes.BAD_REQUEST).json(new ApiError(StatusCodes.BAD_REQUEST,'Invalid Approval Type' ));
            }
            if(user.role !== Roles.ADMIN && user.role !== Roles.SITE_SUPERVISOR){ 
                return res.status(StatusCodes.BAD_REQUEST).json(new ApiError(StatusCodes.BAD_REQUEST,'You are not authorized to update approvals' ));
            }
            const filter = { _id: req.params.id, org: user.org };
            const data = await this.service.updateOne(filter, approvalData);
            res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, data, 'Approval updated successfully'));
        } catch (error) {
            next(error);
        }
    }
    async delete (req, res, next) {
        try {
            const user= req.user;
            if(user.role !== Roles.ADMIN && user.role !== Roles.SITE_SUPERVISOR){ 
                return res.status(StatusCodes.BAD_REQUEST).json(new ApiError(StatusCodes.BAD_REQUEST,'You are not authorized to delete approvals' ));
            }
            const filter = { _id: req.params.id, org: user.org };
            const data = await this.service.deleteOne(filter);
            res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, data, 'Approval deleted successfully'));
        } catch (error) {
            next(error);
        }
    }
    // Example custom controller method: Get approvals by site
    async getApprovalsBySite(req, res, next) {
        try {
            const filter = { site: req.params.siteId , org: req.user.org };
            if(req.user.role !== Roles.ADMIN && req.user.role !== Roles.SITE_SUPERVISOR){ 
                return res.status(StatusCodes.BAD_REQUEST).json(new ApiError(StatusCodes.BAD_REQUEST,'You are not authorized to view approvals' ));
            }
            const approvals = await this.service.findApprovalsBySite(filter);
            res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, approvals, 'Approvals retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }
    async uploadImages(req, res, next) {
        try {
            // Check if files are uploaded
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ success: false, message: 'No files uploaded' });
            }
    
            // Extract approval ID
            const approvalId = req.params.id;
    
            // Build file data for each uploaded file
            const uploadedFiles = req.files.map((file) => ({
                filename: file.filename,
                type: file.mimetype,
                size: file.size,
                org: req.user.org, // Assuming org is provided in the request body
                uploadedBy: req.user.userId, // Assuming userId is in the authenticated user object
                url: `${process.env.BASE_URL}/api/v1/files/link/${file.id}`, // Example URL format
            }));
    
            // Call service to save files and link to the approval
            const updatedApproval = await this.service.addImagesToApproval(approvalId, uploadedFiles);
    
            res.status(200).json({ success: true, data: updatedApproval });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ApprovalController();
