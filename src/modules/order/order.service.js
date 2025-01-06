const { TransferTypes } = require('../../utils/enums');
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

    async createTransferFlow(orderData) {
        try {
            const { site, inventory, materials, priority, transferType, org, createdBy } = orderData;
    
            // Validate transfer type
            if (!TransferTypes.includes(transferType)) {
                throw new Error('Invalid transfer type');
            }
    
            // Create the Order
            const order = await Order.create({
                createdBy,
                site: transferType.includes('site') ? site : null,
                inventory: transferType.includes('inventory') ? inventory : null,
                materials,
                priority,
                status: 'Pending', // Default status
                org,
                assignedTo: orderData.assignedTo,
                fulfillment: [], // Fulfillments to be created later
            });
    
            // Create the Request Fulfillment
            const fulfillment = await RequestFulfillment.create({
                orderId: order._id,
                materialList: materials.map(material => material.material), // Assuming materials have material refs
                status: 'Pending', // Initial status
                transferredFrom: transferType.startsWith('site') ? site : inventory,
                transferFromType: transferType.startsWith('site') ? 'Site' : 'Inventory',
                transferredTo: transferType.endsWith('site') ? site : inventory,
                transferToType: transferType.endsWith('site') ? 'Site' : 'Inventory',
                transferType,
            });
    
            // Link fulfillment to the order
            order.fulfillment.push(fulfillment._id);
            await order.save();
    
            return { order, fulfillment };
        } catch (error) {
            console.error('Error creating transfer flow:', error);
            throw error;
        }
    }

    async createOrder (orderData) {
        return await this.model.create(orderData);
    }
    async reviewOrder (orderId, status) {
        const order = await this.model.findById(orderId);
        if (!order) throw new Error('Order not found');
    
        order.status = status;
        await order.save();
    
        return order;
    }
    
    
}

module.exports = new OrderService();
