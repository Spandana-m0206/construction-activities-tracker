const BaseService = require('../base/BaseService');
const Stock = require('./stock.model');

class StockService extends BaseService {
    constructor() {
        super(Stock); // Pass the Stock model to the BaseService
    }

    // Example custom service method: Get stock by material
    async findStockByMaterial(materialId) {
        return await this.model.model.find({ material: materialId })
            .populate('material', 'name category')
            .populate('site', 'name location')
            .populate('inventory', 'name address')
            .populate('org', 'name');
    }

    // Example custom service method: Get stock by organization
    async findStockByOrg(orgId) {
        return await this.model.model.find({ org: orgId })
            .populate('material', 'name category')
            .populate('site', 'name location')
            .populate('inventory', 'name address');
    }
}

module.exports = new StockService();
