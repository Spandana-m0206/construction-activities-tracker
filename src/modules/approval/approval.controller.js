const { ApprovalStatuses, ApprovalTypes, Roles } = require('../../utils/enums');
const { default: enumToArray } = require('../../utils/EnumToArray');
const BaseController = require('../base/BaseController');
const ApprovalService = require('./approval.service');

class ApprovalController extends BaseController {
    constructor() {
        super(ApprovalService); // Pass the ApprovalService to the BaseController
    }

    async create(req, res, next) {
        try {
            const approvalData = req.body;
            const user= req.user;
            if(!approvalData.task || !approvalData.site || !approvalData.org || !approvalData.approvedBy || !approvalData.images || !approvalData.status || !approvalData.type) {
                return res.status(400).json({ message: 'Please fill all required fields' });
            } 
            if(approvalData.org != user.org) { 
                return res.status(400).json({ message: 'Organization mismatch' });
            }
            if(!enumToArray(ApprovalStatuses).includes(approvalData.status)) {
                return res.status(400).json({ message: 'Invalid Approval status' });
            }
            if(!enumToArray(ApprovalTypes).includes(approvalData.type)) {
                return res.status(400).json({ message: 'Invalid Approval Type' });
            }
            if(user.role !== Roles.ADMIN && user.role !== Roles.SITE_SUPERVISOR){ 
                return res.status(400).json({ message: 'You are not authorized to create approvals' });
            }

            const data = await this.service.create(approvalData);
            res.status(201).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }
    async find(req, res, next) {
        try {
            const user= req.user;
            if(user.role !== Roles.ADMIN && user.role !== Roles.SITE_SUPERVISOR){ 
                return res.status(400).json({ message: 'You are not authorized to view approvals' });
            }
            const data = await this.service.find({org: user.org});
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }
    async findOne(req, res, next) {
        try {
            const user= req.user;
            if(user.role !== Roles.ADMIN && user.role !== Roles.SITE_SUPERVISOR){ 
                return res.status(400).json({ message: 'You are not authorized to view approvals' });
            }
            const filter = { _id: req.params.id, org: user.org };
            const data = await this.service.find(filter);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    async update (req, res, next) {
        try {
            const approvalData = req.body;
            const user= req.user;
            if(approvalData.org) {
                return res.status(400).json({ message: 'Organization cannot be updated' });
            }

            if(approvalData.status && !enumToArray(ApprovalStatuses).includes(approvalData.status)) {
                return res.status(400).json({ message: 'Invalid Approval status' });
            }
            if(approvalData.type && !enumToArray(ApprovalTypes).includes(approvalData.type)) {
                return res.status(400).json({ message: 'Invalid Approval Type' });
            }
            if(user.role !== Roles.ADMIN && user.role !== Roles.SITE_SUPERVISOR){ 
                return res.status(400).json({ message: 'You are not authorized to update approvals' });
            }
            const filter = { _id: req.params.id, org: user.org };
            const data = await this.service.updateOne(filter, approvalData);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }
    async delete (req, res, next) {
        try {
            const user= req.user;
            if(user.role !== Roles.ADMIN && user.role !== Roles.SITE_SUPERVISOR){ 
                return res.status(400).json({ message: 'You are not authorized to delete approvals' });
            }
            const filter = { _id: req.params.id, org: user.org };
            const data = await this.service.deleteOne(filter);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }
    // Example custom controller method: Get approvals by site
    async getApprovalsBySite(req, res, next) {
        try {
            const filter = { site: req.params.siteId , org: req.user.org };
            if(req.user.role !== Roles.ADMIN && req.user.role !== Roles.SITE_SUPERVISOR){ 
                return res.status(400).json({ message: 'You are not authorized to view approvals' });
            }
            const approvals = await this.service.findApprovalsBySite(filter);
            res.status(200).json({ success: true, data: approvals });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ApprovalController();
