const express = require('express');
const InventoryController = require('./inventory.controller');

const router = express.Router();

// Base routes from BaseController
router.post('/', InventoryController.create.bind(InventoryController)); // Create inventory
router.get('/', InventoryController.find.bind(InventoryController)); // Get all inventories
router.get('/:id', InventoryController.findOne.bind(InventoryController)); // Get inventory by ID
router.put('/:id', InventoryController.update.bind(InventoryController)); // Update inventory
router.delete('/:id', InventoryController.delete.bind(InventoryController)); // Delete inventory

// Custom route: Get inventories by manager
router.get('/manager/:managerId', InventoryController.getInventoriesByManager.bind(InventoryController)); // Find inventories by manager

module.exports = router;
