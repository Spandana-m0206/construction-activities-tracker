const BaseService = require('../base/BaseService');
const Penalty = require('./penalty.model');

class PenaltyService extends BaseService {
    constructor() {
        super(Penalty); // Pass the Penalty model to the BaseService
    }

    // Example custom service method: Get penalties by organization
    async findPenaltiesByOrg(orgId) {
        return await this.model.find({ org: orgId })
            .populate('person', 'name email')
            .populate('penaltyBy', 'name email')
            .populate('approvedBy', 'name email')
            .populate('site', 'name location');
    }
}

module.exports = new PenaltyService();
