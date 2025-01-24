const { OrderStatuses } = require('../../utils/enums');
const BaseController = require('../base/BaseController');
const siteService = require('../site/site.service');
const inventoryService = require('../inventory/inventory.service');
const OrderService = require('./order.service');
const messageService = require('../message/message.service');
const { emitMessage } = require('../../utils/socketMessageEmitter');
const OrderModel = require('./order.model');
const {StatusCodes} = require('http-status-codes');
const ApiResponse = require('../../utils/apiResponse');
class OrderController extends BaseController {
    constructor() {
        super(OrderService); // Pass the OrderService to the BaseController
    }

    // Example custom controller method: Get orders by organization
    async getOrdersByOrg(req, res, next) {
        try {
            const orders = await this.service.findOrdersByOrg(req.params.orgId);
            res.status(200).json({ success: true, data: orders });
        } catch (error) {
            next(error);
        }
    }
    async getSummary(req, res, next) {
        try {
          const orgId = req.user.org;
          const summary = await OrderModel.aggregate([
            {
              $match: { org: orgId }, // Match orders for the organization
            },
            {
              $group: {
                _id: '$status', // Group by the 'status' field
                count: { $sum: 1 }, // Count the number of orders for each status
              },
            },
          ]);
      
          // Extract counts for COMPLETED and calculate pending requests
          const completedCount = summary.find(item => item._id === 'COMPLETED')?.count || 0;
          const totalCount = summary.reduce((sum, item) => sum + item.count, 0);
          const pendingCount = totalCount - completedCount;
      
          // Return only completed and pending counts
          const data = {
            completed: completedCount,
            pending: pendingCount,
          };
          res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, data, 'Order summary retrieved successfully'));
        } catch (error) {
          next(error);
        }
    }      
    async getTodayOrders(req, res, next) {
        try {
            // Extract organization ID from req.user
            const orgId = req.user.org;  
            // Calculate start and end of today
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0); // Midnight
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999); // End of the day
        
            // Query today's orders for the organization
            const todaysOrders = await this.service.findTodayOrder({
              org: orgId,
              createdAt: { $gte: startOfDay, $lt: endOfDay },
            });
        
            res.status(StatusCodes.OK).json(new ApiResponse(200, todaysOrders, 'Today\'s orders retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }
    async createMaterialRequest(req, res, next) {
        try {
            const { 
                site, 
                inventory, 
                materials, 
                priority, 
                task, 
                fromInventory, 
                fromSite 
            } = req.body;
        
            // Validate Target: Exactly one of 'site' or 'inventory' must be specified
            if ((site && inventory) || (!site && !inventory)) {
                throw new Error('Exactly one of "site" or "inventory" must be specified as the target.');
            }
    
            // Validate Source: Exactly one of 'fromSite' or 'fromInventory' must be specified
            if ((fromSite && fromInventory) || (!fromSite && !fromInventory)) {
                throw new Error('Exactly one of "fromSite" or "fromInventory" must be specified as the source.');
            }
    
            let assignedTo;
            let orderContent;
    
            // Determine Target Details
            let targetName = '';
            if (site) {
                const siteDetails = await siteService.findById(site);
                if (!siteDetails || !siteDetails.supervisor) {
                    throw new Error('Target Site or Site Supervisor not found.');
                }
                assignedTo = siteDetails.supervisor;
                targetName = siteDetails.name;
            } else if (inventory) {
                const inventoryDetails = await inventoryService.findById(inventory);
                if (!inventoryDetails || !inventoryDetails.manager) {
                    throw new Error('Target Inventory or Inventory Manager not found.');
                }
                assignedTo = inventoryDetails.manager;
                targetName = inventoryDetails.name;
            }
    
            // Determine Source Details
            let sourceName = '';
            if (fromSite) {
                const sourceSiteDetails = await siteService.findById(fromSite);
                if (!sourceSiteDetails) {
                    throw new Error('Source Site not found.');
                }
                sourceName = sourceSiteDetails.name;
            } else if (fromInventory) {
                const sourceInventoryDetails = await inventoryService.findById(fromInventory);
                if (!sourceInventoryDetails) {
                    throw new Error('Source Inventory not found.');
                }
                sourceName = sourceInventoryDetails.name;
            }
    
            // Set Order Content Based on Target and Source
            if (site && fromSite) {
                orderContent = `Added Material Request For Site: ${targetName} from Site: ${sourceName}`;
            } else if (site && fromInventory) {
                orderContent = `Added Material Request For Site: ${targetName} from Inventory: ${sourceName}`;
            } else if (inventory && fromSite) {
                orderContent = `Added Material Request For Inventory: ${targetName} from Site: ${sourceName}`;
            } else if (inventory && fromInventory) {
                orderContent = `Added Material Request For Inventory: ${targetName} from Inventory: ${sourceName}`;
            }
    
            // Construct Order Payload
            const orderPayload = {
                createdBy: req.user._id,
                site: site || null,                 // Target Site
                inventory: inventory || null,       // Target Inventory
                fromSite: fromSite || null,         // Source Site
                fromInventory: fromInventory || null, // Source Inventory
                materials: materials.map(material => ({
                    material: material.material,
                    quantity: parseInt(material.quantity, 10),
                })),
                priority: priority || 'high',       // Default Priority
                task: task || null,                 // Associated Task
                status: OrderStatuses.IN_PROGRESS,  // Order Status
                assignedTo: assignedTo,             // Assigned To Manager/Supervisor
                org: req.user.org,                  // Organization
            };
    
            // Create the Order
            const order = await OrderService.createOrder(orderPayload);
            order.content = orderContent;
    
            // Create and Emit Message
            const orderCreatedMessage = await messageService.materialOrderStatusMessage(order);
            const { messages } = await messageService.getFormattedMessage(orderCreatedMessage._id);
            emitMessage(messages[0], req.user.org.toString());
    
            // Respond to Client
            res.status(200).json({ success: true, data: order });
        } catch (error) {
            console.error('Error in createMaterialRequest:', error);
            // Customize error response if needed
            res.status(400).json({ success: false, message: error.message });
            // Alternatively, pass the error to the next middleware
            // next(error);
        }
    };    

    async reviewMaterialRequest(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const order = await OrderService.reviewOrder(id, status);

            res.status(200).json({ success: true, data: order });
        } catch (error) {
            next(error);
        }
    };
    async getMyOrders(req, res, next) {
        try {
            const { site: siteId, inventory: inventoryId } = req.query;
            const orders = await this.service.getMyOrders(siteId, inventoryId, req.user.org);
            return res.status(200).json({ success: true, data: orders });
        }
        catch (error) {
            next(error);
        }
    };

    async getTransferRequests(req, res, next){
        try{
            const { fromSite, fromInventory } = req.query;
            const orders = await this.service.getTransferRequests(fromSite, fromInventory, req.user.org);
            return res.status(200).json({ success: true, data: orders });
        }
        catch (error){
            next(error);
        }
    }

    async findOne(req, res, next) {
        try {
            const orders = await this.service.getDetailedOrder({_id: req.params.id });
            res.status(200).json({ success: true, data: orders });
        } catch (error) {
            next(error);
        }
    }
    async getRequestsForSite (req, res, next) {
        try {
            const  siteId  = req.params.siteId;
            const requests = await OrderService.getRequestsForSite(siteId);
    
            res.status(200).json({ success: true, data: requests });
        } catch (error) {
            next(error);

        }
    };
 

}

module.exports = new OrderController();
