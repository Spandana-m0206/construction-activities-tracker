const BaseService = require('../base/BaseService');
const Approval = require('./approval.model');

class ApprovalService extends BaseService {
    constructor() {
        super(Approval); // Pass the Approval model to the BaseService
    }

    async find(filters) {
        return await this.model.find(filters)
            .populate({
                path: 'task',
                select: 'title isSystemGenerated priority startTime endTime', // Populate relevant Task fields
                populate: [
                    {
                        path: 'assignedTo',
                        select: 'name email role', // Populate User fields in Task
                    },
                    {
                        path: 'createdBy',
                        select: 'name email', // Populate User fields for createdBy
                    },
                    {
                        path: 'site',
                        select: '_id name', // Populate User fields for createdBy
                    },
                ],
            })
            .populate('site', 'name location') // Populate Site details (adjust fields as necessary)
            .populate('approvedBy', 'name email role'); // Populate User details for approvedBy (adjust fields as necessary)
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
