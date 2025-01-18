const { default: mongoose } = require('mongoose');
const { TransferTypes, OrderStatuses } = require('../../utils/enums');
const BaseService = require('../base/BaseService');
const OrderModel = require('./order.model');
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
            orders = await this.model.find({ fromSite: fromSite, org: orgId })
            .populate('site', 'name location')
            .populate('inventory', 'name address')
            .populate('fromInventory', 'name address')
            .populate('fromSite', 'name location')
            .lean();
        }
        if(fromInventory){
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
            orders = await this.model.find({ site: siteId, org: orgId })
            .populate('site', 'name location')
            .populate('inventory', 'name address')
            .populate('fromInventory', 'name address')
            .populate('fromSite', 'name location')
            .lean();
        }
        if(inventoryId){
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
        // Fetch the order with all necessary fields populated
        const order = await this.model.findOne(query)
            .populate('site', 'name location') // Populate site with name and location
            .populate('inventory', 'name address') // Populate inventory with name and address
            .populate('fromInventory', 'name address') // Populate fromInventory with name and address
            .populate('fromSite', 'name location') // Populate fromSite with name and location
            .populate({
                path: 'materials.material', // Populate material inside materials
                select: 'name category', // Select only name and category
            })
            .populate({
                path: 'fulfilledMaterials.material', // Populate material inside fulfilledMaterials
                select: 'name category', // Select only name and category
            })
            .lean(); // Use lean for better performance when transforming data
    
        if (!order) {
            return null; // Return null if no order is found
        }
    
        // Fetch fulfillments separately to ensure nested materialList is populated
        const fulfillments = await fulfillmentService.findFulfillmentsByOrder(order._id);
        // Transform the order data
        const a = {
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
                category: material.material.category,
                quantity: material.quantity,
            })),
            fulfillments: fulfillments.map((fulfillment) => ({
                _id: fulfillment._id,
                status: fulfillment.status,
                transferFromType: fulfillment.transferFromType,
                transferredFromName: fulfillment.transferredFrom?.name || null,
                materialList: fulfillment.materialList.map((item) => ({
                    _id: item.materialMetadata._id,
                    name: item.materialMetadata.name,
                    category: item.materialMetadata.category,
                    quantity: item.qty, // Assuming `qty` is the field for quantity
                })),
                fulfilledOn: fulfillment.fulfilledOn,
                receivedOn: fulfillment.receivedOn || null,
            })),
        };

        return a;
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
    async getRequestsForSite(siteId) {
        try {

          const objectIdSite = new mongoose.Types.ObjectId(siteId);
      
          // Let's assume "not received" means status != "RECEIVED"
          // or maybe you want "status: IN_PROGRESS"
          // or (receivedOn === null). 
          // Adjust to your actual logic.
          const orders = await OrderModel.aggregate([
            {
              $match: {
                // Filter for orders belonging to this site
                site: objectIdSite,
              },
            },
            {
              // Sort by creation date descending
              $sort: { createdAt: -1 },
            },
            {
              // 3) Project only the fields you need
              $project: {
                // Exclude internal _id from final result
                _id: 0,
      
                // Convert the MongoDB ObjectId to a string
                orderId: { $toString: '$_id' },
      
                // totalItems => length of the "materials" array
                totalItems: {
                  $size: { $ifNull: ['$materials', []] },
                },
      
                // requestedDate => from createdAt
                requestedDate: {
                  $dateToString: {
                    format: '%d %b %Y',
                    date: '$createdAt',
                  },
                },
      
                // status => Map your internal statuses to "waiting" / "dispatched" etc.
                status: {
                  $switch: {
                    branches: [
                      {
                        case: { $eq: ['$status', OrderStatuses.IN_PROGRESS] },
                        then: 'waiting',
                      },
                      {
                        case: { $eq: ['$status', OrderStatuses.IN_TRANSIT] },
                        then: 'dispatched',
                      },
                      // Add more branches if you have more statuses
                    ],
                    default: 'waiting', // fallback if no branch matches
                  },
                },
              },
            },
          ]);
      
        return orders;
        } catch (error) {
          throw new Error("Error Fetching Material Requests", error)
      }
      }
      
}

module.exports = new OrderService();
