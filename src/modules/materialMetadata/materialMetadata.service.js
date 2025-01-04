const BaseService = require('../base/BaseService');
const MaterialMetadata = require('./materialMetadata.model');

class MaterialMetadataService extends BaseService {
    constructor() {
        super(MaterialMetadata); // Pass the MaterialMetadata model to the BaseService
    }

    // Example custom service method: Get materials by category
    async findMaterialsByCategory(filter={}) {
        return await this.model.find(filter).populate('createdBy', 'name email').populate('org', 'name');
    }
}

module.exports = new MaterialMetadataService();
