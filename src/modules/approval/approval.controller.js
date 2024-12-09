const BaseController = require('../base/BaseController');
const ApprovalService = require('./approval.service');

class ApprovalController extends BaseController {
    constructor() {
        super(ApprovalService); // Pass the ApprovalService to the BaseController
    }

    // Example custom controller method: Get approvals by site
    async getApprovalsBySite(req, res, next) {
        try {
            const approvals = await this.service.findApprovalsBySite(req.params.siteId);
            res.status(200).json({ success: true, data: approvals });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ApprovalController();
