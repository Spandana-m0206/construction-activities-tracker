const express = require('express');
const OrderController = require('./order.controller');

const router = express.Router();

router.post('/request', OrderController.createMaterialRequest);
router.put('/review/:id', OrderController.reviewMaterialRequest);
// router.post('/material-transfers', OrderController.transferMaterials);
router.get('/summary', OrderController.getSummary.bind(OrderController)); // Get order summary
router.get('/today', OrderController.getTodayOrders.bind(OrderController)); // Get today's orders
// Base routes from BaseController
// router.post('/', OrderController.create.bind(OrderController)); // Create order
router.get('/', OrderController.find.bind(OrderController)); // Get all orders
router.get('/:id', OrderController.findOne.bind(OrderController)); // Get order by ID
router.put('/:id', OrderController.update.bind(OrderController)); // Update order
router.delete('/:id', OrderController.delete.bind(OrderController)); // Delete order

router.get('/org/:orgId', OrderController.getOrdersByOrg.bind(OrderController)); // Find orders by organization

module.exports = router;
