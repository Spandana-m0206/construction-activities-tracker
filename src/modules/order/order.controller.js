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
    async createMaterialRequest  (req, res, next)  {
        try {
            const { site, materials, priority, task, fromInventory, fromSite} = req.body;

            let assignedTo;

            if (site) {
                const siteDetails = await siteService.findById(site);
                if (!siteDetails || !siteDetails.supervisor) {
                    throw new Error('Site or Site Manager not found');
                }
                assignedTo = siteDetails.supervisor;
            } else if (fromInventory) {
                const inventoryDetails = await inventoryService.findById(fromInventory);
                if (!inventoryDetails || !inventoryDetails.manager) {
                    throw new Error('Inventory or Inventory Manager not found');
                }
                assignedTo = inventoryDetails.manager;
            } else {
                throw new Error('Either site or fromInventory must be specified');
            }

            const order = await OrderService.createOrder({
                createdBy: req.user._id,
                site,
                materials,
                priority,
                status: OrderStatuses.IN_PROGRESS,
                assignedTo: assignedTo,
                task: task,
                org: req.user.org,
                fromInventory,
                fromSite
            });
          const siteData=await siteService.findById(site)
           order.content=`Added Material Request For ${siteData.name}`;
           const orderCreatedMessage=await messageService.materialOrderStatusMessage(order)
           const {messages} = await messageService.getFormattedMessage(orderCreatedMessage._id)
           emitMessage(messages[0], req.user.org.toString())
            

            res.status(200).json({ success: true, data: order });
        } catch (error) {
            next(error);
        }
    };

    async reviewMaterialRequest (req, res, next){
        try {
            const { id } = req.params;
            const { status } = req.body;
            const order = await OrderService.reviewOrder(id, status);
    
            res.status(200).json({ success: true, data: order });
        } catch (error) {
            next(error);
        }
    };
    
}

module.exports = new OrderController();
