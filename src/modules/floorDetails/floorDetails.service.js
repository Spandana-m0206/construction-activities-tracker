const BaseService = require('../base/BaseService');
const FloorDetails = require('./floorDetails.model');

class FloorDetailsService extends BaseService {
    constructor() {
        super(FloorDetails); // Pass the Floor Details model to the BaseService
    }

    // Example custom service method: Get floor details by site
    async findFloorDetailsBySite(siteId) {
        return await this.model.model.find({ site: siteId }).populate('site', 'name location');
    }
}

module.exports = new FloorDetailsService();
