const express = require('express');
const RequestFulfillmentController = require('./requestFulfillment.controller');

const router = express.Router();

router.post('/dispatch', RequestFulfillmentController.dispatchMaterials);
router.post('/ack/:id', RequestFulfillmentController.acknowledgeReceipt);

// Base routes from BaseController
router.post('/', RequestFulfillmentController.create.bind(RequestFulfillmentController)); // Create fulfillment
router.get('/', RequestFulfillmentController.find.bind(RequestFulfillmentController)); // Get all fulfillments
router.get('/:id', RequestFulfillmentController.findOne.bind(RequestFulfillmentController)); // Get fulfillment by ID
router.put('/:id', RequestFulfillmentController.update.bind(RequestFulfillmentController)); // Update fulfillment
router.delete('/:id', RequestFulfillmentController.delete.bind(RequestFulfillmentController)); // Delete fulfillment

// Custom route: Get fulfillments by order ID
router.get('/order/:orderId', RequestFulfillmentController.getFulfillmentsByOrder.bind(RequestFulfillmentController)); // Find fulfillments by order ID

module.exports = router;
