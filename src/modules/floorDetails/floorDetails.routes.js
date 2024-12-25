const express = require('express');
const FloorDetailsController = require('./floorDetails.controller');

const router = express.Router();

// Base routes from BaseController
router.post('/:site', FloorDetailsController.create.bind(FloorDetailsController)); // Create floor details
router.get('/site/:site', FloorDetailsController.find.bind(FloorDetailsController)); // Get all floor details
router.get('/:id', FloorDetailsController.findOne.bind(FloorDetailsController)); // Get floor details by ID
router.put('/:id', FloorDetailsController.update.bind(FloorDetailsController)); // Update floor details
router.delete('/:id', FloorDetailsController.delete.bind(FloorDetailsController)); // Delete floor details

// Custom route: Get floor details by site
router.get('/site/:siteId', FloorDetailsController.getFloorDetailsBySite.bind(FloorDetailsController)); // Find floor details by site

module.exports = router;
