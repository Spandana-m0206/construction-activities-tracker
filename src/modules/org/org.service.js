const BaseService = require('../base/BaseService');
const OrgModel = require('./org.model');

class OrgService extends BaseService {
    constructor() {
        super(OrgModel); // Pass the Org model to the BaseService
    }

    // Example of a custom service method
    async getOrgsWithAdminDetails(filter = {}) {
        return await this.model.find(filter).populate('admin', 'name email'); // Populate admin details
    }
}

module.exports = new OrgService();
