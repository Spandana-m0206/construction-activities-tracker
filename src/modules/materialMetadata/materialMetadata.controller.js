const BaseController = require('../base/BaseController');
const MaterialMetadataService = require('./materialMetadata.service');

class MaterialMetadataController extends BaseController {
    constructor() {
        super(MaterialMetadataService); // Pass the MaterialMetadataService to the BaseController
    }

    // Example custom controller method: Get materials by category
    async getMaterialsByCategory(req, res, next) {
        try {
            const materials = await this.service.findMaterialsByCategory(req.params.category);
            res.status(200).json({ success: true, data: materials });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new MaterialMetadataController();
