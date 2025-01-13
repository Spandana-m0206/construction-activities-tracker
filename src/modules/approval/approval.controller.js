const ApiError = require('../../utils/apiError');
const { ApprovalStatuses, ApprovalTypes, Roles } = require('../../utils/enums');
const enumToArray = require('../../utils/EnumToArray');
const BaseController = require('../base/BaseController');
const ApprovalService = require('./approval.service');
const { StatusCodes } = require("http-status-codes");
const ApiResponse = require('../../utils/apiResponse');
const messageService = require('../message/message.service');
const taskService = require('../task/task.service');
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
            const task=await taskService.findById(approvalData.task)
            //TODO: what should be the content ? 
                  data.content=`${task.progressPercentage}% Completed ${task.name}`;
                       const approvalRequestMessage=await messageService.approvalRequestSuccessMessage(order)
                       const {messages} = await messageService.getFormattedMessage(approvalRequestMessage._id)
                       emitMessage(messages[0], req.user.org.toString())
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
}

module.exports = new ApprovalController();
