const { TransferTypes, OrderStatuses } = require('../../utils/enums');
const BaseService = require('../base/BaseService');
const Order = require('./order.model');
const fulfillmentService = require('../requestFulfillment/requestFulfillment.service');

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
        return await this.model.find({ org: orgId })
            .populate('createdBy', 'name email')
            .populate('site', 'name location')
            .populate('inventory', 'name address')
            .populate('fromInventory', 'name address')
            .populate('fromSite', 'name location')
            .populate('task', 'title status')
            .populate('materials.material', 'name category')
    }

    async getTransferRequests(fromSite, fromInventory, orgId) {
        let orders;
        if(fromSite){
            console.log('fromSite', fromSite)
            orders = await this.model.find({ fromSite: fromSite, org: orgId })
            .populate('site', 'name location')
            .populate('inventory', 'name address')
            .populate('fromInventory', 'name address')
            .populate('fromSite', 'name location')
            .lean();
        }
        if(fromInventory){
            console.log('fromInventory', fromInventory)
            orders = await this.model.find({ fromInventory: fromInventory, org: orgId })
            .populate('site', 'name location')
            .populate('inventory', 'name address')
            .populate('fromInventory', 'name address')
            .populate('fromSite', 'name location')
            .lean();
        }
            const formattedOrders = await Promise.all(orders.map(async (order) => {
                return {
                    _id: order._id,
                    createdAt: order.createdAt,
                    dispatchedAt: order.dispatchedOn || null,
                    completedAt: order.completedOn || null,
                    status: order.status,
                    totalItems: order.materials ? order.materials.length : 0,
                    fromSite: order.fromSite ? {
                        _id: order.fromSite._id,
                        name: order.fromSite.name,
                        location: order.fromSite.location,
                    } : null,
                    fromInventory: order.fromInventory ? {
                        _id: order.fromInventory._id,
                        name: order.fromInventory.name,
                        location: order.fromInventory.address,
                    } : null,
                    site: order.site ? {
                        _id: order.site._id,
                        name: order.site.name,
                        location: order.site.location,
                    } : null,
                    inventory: order.inventory ? {
                        _id: order.inventory._id,
                        name: order.inventory.name,
                        location: order.inventory.address,
                    } : null,
                };
            }));
        
            return formattedOrders;
    }


    async getMyOrders(siteId, inventoryId, orgId) {
        let orders;
        if(siteId){
            console.log('siteId', siteId)
            orders = await this.model.find({ site: siteId, org: orgId })
            .populate('site', 'name location')
            .populate('inventory', 'name address')
            .populate('fromInventory', 'name address')
            .populate('fromSite', 'name location')
            .lean();
        }
        if(inventoryId){
            console.log('inventoryId', inventoryId)
            orders = await this.model.find({ site: siteId, org: orgId })
            .populate('site', 'name location')
            .populate('inventory', 'name address')
            .populate('fromInventory', 'name address')
            .populate('fromSite', 'name location')
            .lean();
        }

            const formattedOrders = await Promise.all(orders.map(async (order) => {
                return {
                    _id: order._id,
                    createdAt: order.createdAt,
                    dispatchedAt: order.dispatchedOn || null,
                    completedAt: order.completedOn || null,
                    status: order.status,
                    totalItems: order.materials ? order.materials.length : 0,
                    fromSite: order.fromSite ? {
                        _id: order.fromSite._id,
                        name: order.fromSite.name,
                        location: order.fromSite.location,
                    } : null,
                    fromInventory: order.fromInventory ? {
                        _id: order.fromInventory._id,
                        name: order.fromInventory.name,
                        location: order.fromInventory.address,
                    } : null,
                    site: order.site ? {
                        _id: order.site._id,
                        name: order.site.name,
                        location: order.site.location,
                    } : null,
                    inventory: order.inventory ? {
                        _id: order.inventory._id,
                        name: order.inventory.name,
                        location: order.inventory.address,
                    } : null,
                };
            }));
        
            return formattedOrders;
    }
    async getDetailedOrder(query) {
        const order = await this.model.findOne(query)
            .populate('site', 'name location')
            .populate('inventory', 'name address')
            .populate('fromInventory', 'name address')
            .populate('fromSite', 'name location')
            .populate('materials.material', 'name category')
            .populate('fulfilledMaterials.material', 'name category')
            .populate('fulfillment')
            .lean(); // Use lean for better performance since you're transforming the data
    
        if (!order) {
            return null; // Return null or handle the case where no order is found
        }
    
        const fulfillments = await fulfillmentService.findFulfillmentsByOrder(order._id);
    
        return {
            _id: order._id,
            createdAt: order.createdAt,
            dispatchedAt: order.dispatchedOn || null,
            completedAt: order.completedOn || null,
            status: order.status,
            totalItems: order.materials ? order.materials.length : 0,
            fromSite: order.fromSite ? {
                _id: order.fromSite._id,
                name: order.fromSite.name,
                location: order.fromSite.location,
            } : null,
            fromInventory: order.fromInventory ? {
                _id: order.fromInventory._id,
                name: order.fromInventory.name,
                location: order.fromInventory.address,
            } : null,
            site: order.site ? {
                _id: order.site._id,
                name: order.site.name,
                location: order.site.location,
            } : null,
            inventory: order.inventory ? {
                _id: order.inventory._id,
                name: order.inventory.name,
                location: order.inventory.address,
            } : null,
            materials: order.materials.map((material) => ({
                _id: material.material._id,
                name: material.material.name,
                quantity: material.quantity,
            })),
            fulfillments: fulfillments.map((fulfillment) => ({
                _id: fulfillment._id,
                status: fulfillment.status,
                transferFromType: fulfillment.transferFromType,
                transferredFromName: fulfillment.transferredFrom?.name || null,
                materialList: fulfillment.materialList.map((item) => ({
                    _id: item.material,
                    name: item.material.name,
                    quantity: item.quantity,
                })),
                fulfilledOn: fulfillment.fulfilledOn,
                receivedOn: fulfillment.receivedOn || null,
            })),
        };
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
