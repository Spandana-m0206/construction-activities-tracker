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

    async getUsageForSite(req, res, next) {
        try {
            const siteId = req.params.siteId;
            const usage = await UsageService.getUsageForSite(siteId);
            res.status(200).json({ success: true, data: usage });
        } catch (error) {
            next(error);
        }
    }

    async getWastageForSite(req, res, next) {
        try {
            const siteId = req.params.siteId;
            const usage = await UsageService.getWastageForSite(siteId);
            res.status(200).json({ success: true, data: usage });
        } catch (error) {
            next(error);
        }
    }

    async createUsage(req, res, next) {
        try {
            const createdBy = req.user.userId;
            const org = req.user.org;
            const usage = await UsageService.createUsage({...req.body, createdBy, org});
            res.status(200).json({ success: true, data: [] });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UsageController();
