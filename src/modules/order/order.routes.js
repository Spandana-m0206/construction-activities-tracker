const express = require('express');
const OrderController = require('./order.controller');

const router = express.Router();

// Base routes from BaseController
router.post('/', OrderController.create.bind(OrderController)); // Create order
router.get('/', OrderController.find.bind(OrderController)); // Get all orders
router.get('/:id', OrderController.findOne.bind(OrderController)); // Get order by ID
router.put('/:id', OrderController.update.bind(OrderController)); // Update order
router.delete('/:id', OrderController.delete.bind(OrderController)); // Delete order

// Custom route: Get orders by organization
router.get('/org/:orgId', OrderController.getOrdersByOrg.bind(OrderController)); // Find orders by organization

module.exports = router;
