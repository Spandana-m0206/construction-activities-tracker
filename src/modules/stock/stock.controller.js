const BaseController = require('../base/BaseController');
const inventoryService = require('../inventory/inventory.service');
const siteService = require('../site/site.service');
const StockItemModel = require('./stock.model');
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
    async getTotalFundUtilization(req, res, next) {
    try {
        // Fetch all sites and inventories for the organization
        const sites = await siteService.find({ org: req.user.org }, { _id: 1, name: 1 });
        const inventories = await inventoryService.find({ org: req.user.org }, { _id: 1, name: 1 });

        const results = [];

        // Calculate fund utilization for sites
        for (const site of sites) {
            // Fetch all stock items for the site
            const stockItems = await StockItemModel.find({ site: site._id }).populate('material').lean();

            // Calculate total fund utilization for the site
            const totalFundUtilization = stockItems.reduce((total, stockItem) => {
                const materialCost = stockItem.material.reduce((sum, material) => {
                    return sum + material.price * material.qty;
                }, 0);
                return total + materialCost;
            }, 0);

            // Add to results
            if(totalFundUtilization > 0) {
                results.push({
                    id: site._id,
                    name: site.name,
                    source: 'site',
                    totalFundUtilization
                });
            }
        }

        // Calculate fund utilization for inventories
        for (const inventory of inventories) {
            // Fetch all stock items for the inventory
            const stockItems = await StockItemModel.find({ inventory: inventory._id }).populate('material').lean();

            // Calculate total fund utilization for the inventory
            const totalFundUtilization = stockItems.reduce((total, stockItem) => {
                const materialCost = stockItem.material.reduce((sum, material) => {
                    return sum + material.price * material.qty;
                }, 0);
                return total + materialCost;
            }, 0);

            // Add to results
            if(totalFundUtilization > 0) {
                results.push({
                    id: inventory._id,
                    name: inventory.name,
                    source: 'inventory',
                    totalFundUtilization
                });
            }
        }
        // Send response
        return res.status(200).json({ success: true, data: results });
    } catch (error) {
        next(error);
    }
}
}

module.exports = new StockController();
