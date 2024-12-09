const BaseController = require('../base/BaseController');
const StockService = require('./stock.service');

class StockController extends BaseController {
    constructor() {
        super(StockService); // Pass the StockService to the BaseController
    }

    // Example custom controller method: Get stock by material
    async getStockByMaterial(req, res, next) {
        try {
            const stock = await this.service.findStockByMaterial(req.params.materialId);
            res.status(200).json({ success: true, data: stock });
        } catch (error) {
            next(error);
        }
    }

    // Example custom controller method: Get stock by organization
    async getStockByOrg(req, res, next) {
        try {
            const stock = await this.service.findStockByOrg(req.params.orgId);
            res.status(200).json({ success: true, data: stock });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new StockController();
