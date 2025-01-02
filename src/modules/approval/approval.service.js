const BaseService = require('../base/BaseService');
const Approval = require('./approval.model');

class ApprovalService extends BaseService {
    constructor() {
        super(Approval); // Pass the Approval model to the BaseService
    }

    // Example custom service method: Get approvals by site
    async findApprovalsBySite(filter = {}) {
        return await this.model.find(filter)
            .populate('task', 'title status')
            .populate('images', 'url')
            .populate('approvedBy', 'name email')
            .populate('org', 'name');
    }
}

module.exports = new ApprovalService();
