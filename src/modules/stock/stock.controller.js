const BaseController = require('../base/BaseController');
const stockService = require('./stock.service');
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

    async getAvailableMaterials(req, res, next) {
        try {
            const { identifier } = req.params;
            const { type } = req.query; // Expect type to be 'site' or 'inventory'
            if (!['site', 'inventory'].includes(type)) {
                throw new Error('Invalid type. Expected "site" or "inventory".');
            }
    
            const stock = await stockService.getAvailableMaterials(identifier, type);
            res.status(200).json({ success: true, data: stock });
        } catch (error) {
            next(error);
        }
    }    

    async getStockItemsQuantities(req, res, next) {
        try {
            const { id } = req.params;
            const { type } = req.query;

            if (!type || !['site', 'inventory'].includes(type)) {
                throw new Error('Invalid type. Expected "site" or "inventory".');
            }
    
            const stock = await stockService.getStockItemsQuantities(id, type);
            res.status(200).json({ success: true, data: stock });
        } catch (error) {
            next(error);
        }
    }    
    
}

module.exports = new StockController();
