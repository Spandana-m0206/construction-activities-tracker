const BaseController = require('../base/BaseController');
const requestFulfillmentService = require('../requestFulfillment/requestFulfillment.service');
const OrderService = require('./order.service');

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
            const { site, materials, priority, assignedTo, task } = req.body;
    
            const order = await OrderService.createOrder({
                createdBy: req.user._id,
                site,
                materials,
                priority,
                status: 'in progress',
                assignedTo,
                task: task,
                org: req.user.org
            });
    
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
