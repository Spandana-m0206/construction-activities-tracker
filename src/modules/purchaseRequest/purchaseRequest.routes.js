const express = require('express');
const PurchaseRequestController = require('./purchaseRequest.controller');

const router = express.Router();

router.post('/create-order', PurchaseRequestController.createOrder.bind(PurchaseRequestController)); // Find purchase requests by inventory
router.get('/get-request-by-inventory/:inventoryId', PurchaseRequestController.getConsolidatedOrderDetails.bind(PurchaseRequestController)); // Find purchase requests by inventory
router.get('/get-detailed-request/:purchaseRequestId', PurchaseRequestController.getDetailedPurchaseRequest.bind(PurchaseRequestController)); // Find purchase requests by inventory

// Base routes from BaseController
router.post('/', PurchaseRequestController.create.bind(PurchaseRequestController)); // Create purchase request
router.get('/', PurchaseRequestController.find.bind(PurchaseRequestController)); // Get all purchase requests
router.get('/:id', PurchaseRequestController.findOne.bind(PurchaseRequestController)); // Get purchase request by ID
router.put('/:id', PurchaseRequestController.update.bind(PurchaseRequestController)); // Update purchase request
router.delete('/:id', PurchaseRequestController.delete.bind(PurchaseRequestController)); // Delete purchase request

// Custom route: Get purchase requests by inventory
router.get('/inventory/:inventoryId', PurchaseRequestController.getRequestsByInventory.bind(PurchaseRequestController)); // Find purchase requests by inventory

router.post('/consolidated-materials', PurchaseRequestController.getConsolidatedMaterials.bind(PurchaseRequestController));

module.exports = router;
