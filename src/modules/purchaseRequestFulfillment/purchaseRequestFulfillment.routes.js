const express = require('express');
const PurchaseRequestFulfillmentController = require('./purchaseRequestFulfillment.controller');

const router = express.Router();

router.post('/mark-received/:id', PurchaseRequestFulfillmentController.markPurchaseAsReceived.bind(PurchaseRequestFulfillmentController));

// Base routes from BaseController
router.post('/', PurchaseRequestFulfillmentController.create.bind(PurchaseRequestFulfillmentController)); // Create fulfillment
router.get('/', PurchaseRequestFulfillmentController.find.bind(PurchaseRequestFulfillmentController)); // Get all fulfillments
router.get('/:id', PurchaseRequestFulfillmentController.findOne.bind(PurchaseRequestFulfillmentController)); // Get fulfillment by ID
router.put('/:id', PurchaseRequestFulfillmentController.update.bind(PurchaseRequestFulfillmentController)); // Update fulfillment
router.delete('/:id', PurchaseRequestFulfillmentController.delete.bind(PurchaseRequestFulfillmentController)); // Delete fulfillment

// Custom route: Get fulfillments by status
router.get('/status/:status', PurchaseRequestFulfillmentController.getFulfillmentsByStatus.bind(PurchaseRequestFulfillmentController)); // Find fulfillments by status

module.exports = router;
