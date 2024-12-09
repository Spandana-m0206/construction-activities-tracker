const BaseController = require('../base/BaseController');
const SiteService = require('./site.service');

class SiteController extends BaseController {
    constructor() {
        super(SiteService); // Pass the SiteService to the BaseController
    }

    // Example custom controller method: Get sites by status
    async getSitesByStatus(req, res, next) {
        try {
            const sites = await this.service.findSitesByStatus(req.params.status);
            res.status(200).json({ success: true, data: sites });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new SiteController();
