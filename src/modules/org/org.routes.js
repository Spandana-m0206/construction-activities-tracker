const express = require('express');
const OrgController = require('./org.controller');

const router = express.Router();

// Base routes from BaseController
router.post('/', OrgController.create.bind(OrgController)); // Create organization
router.get('/', OrgController.find.bind(OrgController)); // Get all organizations
router.get('/:id', OrgController.findOne.bind(OrgController)); // Get organization by ID
router.put('/:id', OrgController.update.bind(OrgController)); // Update organization
router.delete('/:id', OrgController.delete.bind(OrgController)); // Delete organization

// Custom route
router.get('/details', OrgController.getOrgsWithAdminDetails.bind(OrgController)); // Get organizations with admin details

module.exports = router;
