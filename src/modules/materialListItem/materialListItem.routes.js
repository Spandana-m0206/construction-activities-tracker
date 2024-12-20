const express = require('express');
const MaterialListItemController = require('./materialListItem.controller');

const router = express.Router();

// Base routes from BaseController
router.post('/', MaterialListItemController.create.bind(MaterialListItemController)); // Create material list item
router.get('/', MaterialListItemController.find.bind(MaterialListItemController)); // Get all material list items
router.get('/:id', MaterialListItemController.findOne.bind(MaterialListItemController)); // Get material list item by ID
router.put('/:id', MaterialListItemController.update.bind(MaterialListItemController)); // Update material list item
router.delete('/:id', MaterialListItemController.delete.bind(MaterialListItemController)); // Delete material list item

// Custom route: Get material list items by purchase details
router.get('/purchase/:purchaseId', MaterialListItemController.getMaterialListItemsByPurchase.bind(MaterialListItemController)); // Find material list items by purchase details

module.exports = router;
