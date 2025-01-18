const express = require('express');
const UsageController = require('./usage.controller');

const router = express.Router();

router.post('/create-usage', UsageController.createUsage.bind(UsageController)); // Find usage by organization
router.get('/get-usage/:siteId', UsageController.getUsageForSite.bind(UsageController)); // Find usage by organization
router.get('/get-wasted-record/:siteId', UsageController.getWastageForSite.bind(UsageController)); // Find usage by organization

// Base routes from BaseController
router.post('/', UsageController.create.bind(UsageController)); // Create usage
router.get('/', UsageController.find.bind(UsageController)); // Get all usage records
router.get('/:id', UsageController.findOne.bind(UsageController)); // Get usage by ID
router.put('/:id', UsageController.update.bind(UsageController)); // Update usage
router.delete('/:id', UsageController.delete.bind(UsageController)); // Delete usage

// Custom route: Get usage by organization
router.get('/org/:orgId', UsageController.getUsageByOrg.bind(UsageController)); // Find usage by organization

module.exports = router;
