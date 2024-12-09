const BaseService = require('../base/BaseService');
const Order = require('./order.model');

class OrderService extends BaseService {
    constructor() {
        super(Order); // Pass the Order model to the BaseService
    }

    // Example custom service method: Get orders by organization
    async findOrdersByOrg(orgId) {
        return await this.model.model.find({ org: orgId })
            .populate('createdBy', 'name email')
            .populate('site', 'name location')
            .populate('inventory', 'name address')
            .populate('fromInventory', 'name address')
            .populate('fromSite', 'name location')
            .populate('task', 'title status')
            .populate('materials.material', 'name category')
    }
}

module.exports = new OrderService();
