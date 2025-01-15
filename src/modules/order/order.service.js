const { TransferTypes, OrderStatuses } = require('../../utils/enums');
const BaseService = require('../base/BaseService');
const Order = require('./order.model');

class OrderService extends BaseService {
    constructor() {
        super(Order); // Pass the Order model to the BaseService
    }
    async findTodayOrder(filter={}) {
        // Calculate start and end of today
        const data = await this.model.find(filter)
        .populate('fromSite','_id name')
        .populate('fromInventory','_id name');
        
        return data;
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

    async createOrder (orderData) {
        return await this.model.create(orderData);
    }
    async reviewOrder (orderId, status) {
        const order = await this.model.findById(orderId);
        if (!order) throw new Error('Order not found');
        if(status === OrderStatuses.APPROVED){
            order.approvedOn = new Date()
        }
        order.status = status;
        await order.save();
    
        return order;
    }
    async updateOrderStatus(order, materialList) {
        materialList.forEach((item) => {
            const fulfilledMaterial = order.fulfilledMaterials.find(
                (fm) =>
                    fm.material.toString() === item.materialMetadata.toString(),
            );
            if (fulfilledMaterial) {
                fulfilledMaterial.quantity += item.qty;
            } else {
                order.fulfilledMaterials.push({
                    material: item.materialMetadata,
                    quantity: item.qty,
                });
            }
        });

        const isFullyFulfilled = order.materials.every((reqMaterial) => {
            const fulfilled = order.fulfilledMaterials.find(
                (fm) =>
                    fm.material.toString() === reqMaterial.material.toString(),
            );
            return fulfilled && fulfilled.quantity >= reqMaterial.quantity;
        });
        order.status = isFullyFulfilled
            ? OrderStatuses.COMPLETED
            : OrderStatuses.PARTIALLY_FULFILLED;
        await order.save();
    } 
    
}

module.exports = new OrderService();
