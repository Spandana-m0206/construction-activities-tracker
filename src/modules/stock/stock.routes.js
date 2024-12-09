const express = require('express');
const StockController = require('./stock.controller');

const router = express.Router();

// Base routes from BaseController
router.post('/', StockController.create.bind(StockController)); // Create stock
router.get('/', StockController.find.bind(StockController)); // Get all stock
router.get('/:id', StockController.findOne.bind(StockController)); // Get stock by ID
router.put('/:id', StockController.update.bind(StockController)); // Update stock
router.delete('/:id', StockController.delete.bind(StockController)); // Delete stock

// Custom route: Get stock by material
router.get('/material/:materialId', StockController.getStockByMaterial.bind(StockController)); // Find stock by material

// Custom route: Get stock by organization
router.get('/org/:orgId', StockController.getStockByOrg.bind(StockController)); // Find stock by organization

module.exports = router;
