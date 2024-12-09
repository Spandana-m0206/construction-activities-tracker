const BaseService = require('../base/BaseService');
const MaterialMetadata = require('./materialMetadata.model');

class MaterialMetadataService extends BaseService {
    constructor() {
        super(MaterialMetadata); // Pass the MaterialMetadata model to the BaseService
    }

    // Example custom service method: Get materials by category
    async findMaterialsByCategory(category) {
        return await this.model.model.find({ category }).populate('createdBy', 'name email').populate('org', 'name');
    }
}

module.exports = new MaterialMetadataService();
