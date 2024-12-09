const BaseController = require('../base/BaseController');
const OrgService = require('./org.service');

class OrgController extends BaseController {
    constructor() {
        super(OrgService); // Pass the OrgService to the BaseController
    }

    // Example of a custom controller method
    async getOrgsWithAdminDetails(req, res, next) {
        try {
            const orgs = await this.service.getOrgsWithAdminDetails(req.query);
            res.status(200).json({ success: true, data: orgs });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new OrgController();
