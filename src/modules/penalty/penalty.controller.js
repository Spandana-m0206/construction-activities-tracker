const BaseController = require('../base/BaseController');
const PenaltyService = require('./penalty.service');

class PenaltyController extends BaseController {
    constructor() {
        super(PenaltyService); // Pass the PenaltyService to the BaseController
    }

    // Example custom controller method: Get penalties by organization
    async getPenaltiesByOrg(req, res, next) {
        try {
            const penalties = await this.service.findPenaltiesByOrg(req.params.orgId);
            res.status(200).json({ success: true, data: penalties });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PenaltyController();
