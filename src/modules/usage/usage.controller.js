const BaseController = require('../base/BaseController');
const UsageService = require('./usage.service');

class UsageController extends BaseController {
    constructor() {
        super(UsageService); // Pass the UsageService to the BaseController
    }

    // Example custom controller method: Get usage by organization
    async getUsageByOrg(req, res, next) {
        try {
            const usage = await this.service.findUsageByOrg(req.params.orgId);
            res.status(200).json({ success: true, data: usage });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UsageController();
