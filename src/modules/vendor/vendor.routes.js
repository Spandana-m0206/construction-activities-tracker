const express = require('express');
const VendorController = require('./vendor.controller');

const router = express.Router();

// Base routes from BaseController
router.post('/', VendorController.create.bind(VendorController)); // Create vendor
router.get('/', VendorController.find.bind(VendorController)); // Get all vendors
router.get('/:id', VendorController.findOne.bind(VendorController)); // Get vendor by ID
router.put('/:id', VendorController.update.bind(VendorController)); // Update vendor
router.delete('/:id', VendorController.delete.bind(VendorController)); // Delete vendor

// Custom route: Get vendors by organization
router.get('/org/:orgId', VendorController.getVendorsByOrg.bind(VendorController)); // Find vendors by organization

module.exports = router;
