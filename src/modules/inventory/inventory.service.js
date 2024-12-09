const BaseService = require('../base/BaseService');
const Inventory = require('./inventory.model');

class InventoryService extends BaseService {
    constructor() {
        super(Inventory); // Pass the Inventory model to the BaseService
    }

    // Example custom service method: Find inventories by manager
    async findInventoriesByManager(managerId) {
        return await this.model.model.find({ manager: managerId }).populate('manager', 'name email');
    }
}

module.exports = new InventoryService();
