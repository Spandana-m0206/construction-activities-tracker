const { UsageTypes } = require('../../utils/enums');
const BaseService = require('../base/BaseService');
const StockModel = require('../stock/stock.model');
const stockService = require('../stock/stock.service');
const Usage = require('./usage.model');

class UsageService extends BaseService {
    constructor() {
        super(Usage); // Pass the Usage model to the BaseService
    }

    // Example custom service method: Get usage by organization
    async findUsageByOrg(orgId) {
        return await this.model.model.find({ org: orgId })
            .populate('task', 'title status')
            .populate('createdBy', 'name email')
            .populate('site', 'name location')
            .populate('material', 'name category')
            .populate('inventory', 'name address')
            .populate('toSite', 'name location')
            .populate('toInventory', 'name address')
            .populate('orderId', 'status priority');
    
        }
}

module.exports = new UsageService();
