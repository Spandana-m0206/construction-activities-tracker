const BaseService = require('../base/BaseService');
const Site = require('./site.model');

class SiteService extends BaseService {
    constructor() {
        super(Site); // Pass the Site model to the BaseService
    }

    // Example custom service method: Find sites by status
    async findSitesByStatus(status) {
        return await this.model.model.find({ status }).populate('supervisor', 'name').populate('org', 'name');
    }
}

module.exports = new SiteService();
