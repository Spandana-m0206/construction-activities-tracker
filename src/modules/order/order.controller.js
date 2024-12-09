const BaseController = require('../base/BaseController');
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
}

module.exports = new OrderController();
