const { OrderStatuses } = require('../../utils/enums');
const BaseController = require('../base/BaseController');
const siteService = require('../site/site.service');
const inventoryService = require('../inventory/inventory.service');
const OrderService = require('./order.service');
const messageService = require('../message/message.service');
const { emitMessage } = require('../../utils/socketMessageEmitter');

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

           order.content=`Material Request Created For: ${order.materials
          .map((material) => `${material.name} (Qty: ${material.quantity})`)
          .join(', ')}`;
           const orderCreatedMessage=await messageService.materialOrderStatusMessage(order)

           emitMessage(orderCreatedMessage)

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
