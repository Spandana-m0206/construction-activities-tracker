const BaseController = require('../base/BaseController');
const InventoryService = require('./inventory.service');

class InventoryController extends BaseController {
    constructor() {
        super(InventoryService); // Pass the InventoryService to the BaseController
    }

    // Example custom controller method: Get inventories by manager
    async getInventoriesByManager(req, res, next) {
        try {
            const inventories = await this.service.findInventoriesByManager(req.params.managerId);
            res.status(200).json({ success: true, data: inventories });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new InventoryController();
