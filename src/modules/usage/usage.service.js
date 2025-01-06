const BaseService = require('../base/BaseService');
const StockModel = require('../stock/stock.model');
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
    async createUsage (data) {
        const { material, quantity, type, site, inventory, toSite, toInventory } = data;

        const stock = await StockModel.findOne({
            material,
            site: site || null,
            inventory: inventory || null
        });

        if (!stock || stock.quantity < quantity) {
            throw new Error('Insufficient stock for usage');
        }

        switch (type) {
            case 'used':
            case 'wasted':
                stock.quantity -= quantity;
                break;
            case 'transfer':
                stock.quantity -= quantity;
                await StockModel.findOneAndUpdate(
                    { material, site: toSite || null, inventory: toInventory || null },
                    { $inc: { quantity } },
                    { upsert: true }
                );
                break;
            default:
                throw new Error('Invalid usage type');
        }

        await stock.save();
        return await UsageModel.create(data);
    }
}

module.exports = new UsageService();
