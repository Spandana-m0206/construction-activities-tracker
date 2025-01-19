const { UsageTypes } = require('../../utils/enums');
const BaseController = require('../base/BaseController');
const StockItemModel = require('../stock/stock.model');
const UsageModel = require('./usage.model');
const usageService = require('./usage.service');
const UsageService = require('./usage.service');

class UsageController extends BaseController {
    constructor() {
        super(UsageService); // Pass the UsageService to the BaseController
    }

    // Example custom controller method: Get usage by organization
    async getUsageByOrg(req, res, next) {
        try {
            const usage = await this.service.findUsageByOrg(req.params.orgId);
            res.status(200).json({ success: true, data: usage });
        } catch (error) {
            next(error);
        }
    }
    async trackMaterialUsage(req, res, next) {
        try {
            const usage = await usageService.createUsage(req.body);

            res.status(200).json({ success: true, data: usage });
        } catch (error) {
            next(error);
        }
    }

    async getUsage(req, res, next) {
        try {
            const { id } = req.params; // Generic identifier
            const { type } = req.query; // Determine if it's 'site' or 'inventory'
    
            if (!type || !['site', 'inventory'].includes(type)) {
                throw new Error('Invalid type. Expected "site" or "inventory".');
            }
    
            const usage = await UsageService.getUsage(type, id);
            res.status(200).json({ success: true, data: usage });
        } catch (error) {
            next(error);
        }
    }
    
    async getWastage(req, res, next) {
        try {
            const { id } = req.params; // Generic identifier
            const { type } = req.query; // Determine if it's 'site' or 'inventory'
    
            if (!type || !['site', 'inventory'].includes(type)) {
                throw new Error('Invalid type. Expected "site" or "inventory".');
            }
    
            const usage = await UsageService.getWastage(type, id);
            res.status(200).json({ success: true, data: usage });
        } catch (error) {
            next(error);
        }
    }
    
    async getTheft(req, res, next) {
        try {
            const { id } = req.params; // Generic identifier
            const { type } = req.query; // Determine if it's 'site' or 'inventory'
    
            if (!type || !['site', 'inventory'].includes(type)) {
                throw new Error('Invalid type. Expected "site" or "inventory".');
            }
    
            const usage = await UsageService.getTheft(type, id);
            res.status(200).json({ success: true, data: usage });
        } catch (error) {
            next(error);
        }
    }
    
    async createUsage(req, res, next) {
        try {
            const createdBy = req.user.userId;
            const org = req.user.org;
            const { type } = req.body; // 'site' or 'inventory'
    
            if (!type || !['site', 'inventory'].includes(type)) {
                throw new Error('Invalid type. Expected "site" or "inventory".');
            }
    
            const usage = await UsageService.createUsage({ ...req.body, createdBy, org });
            res.status(200).json({ success: true, data: [] });
        } catch (error) {
            next(error);
        }
    }
    
}

module.exports = new UsageController();
