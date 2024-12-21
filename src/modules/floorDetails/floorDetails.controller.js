const BaseController = require('../base/BaseController');
const FloorDetailsService = require('./floorDetails.service');

class FloorDetailsController extends BaseController {
    constructor() {
        super(FloorDetailsService); // Pass the FloorDetailsService to the BaseController
    }

    // Example custom controller method: Get floor details by site
    async getFloorDetailsBySite(req, res, next) {
        try {
            const floorDetails = await this.service.findFloorDetailsBySite(req.params.siteId);
            res.status(200).json({ success: true, data: floorDetails });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new FloorDetailsController();
