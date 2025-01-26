const express = require('express');
const UsageController = require('./usage.controller');

const router = express.Router();

router.get('/get-material-usage/:id', UsageController.getMaterialUsage.bind(UsageController)); // param -> material id | query -> site id
router.post('/create-usage', UsageController.createUsage.bind(UsageController)); 
router.get('/get-usage/:id', UsageController.getUsage.bind(UsageController)); 
router.get('/get-wastage/:id', UsageController.getWastage.bind(UsageController)); 
router.get('/get-theft/:id', UsageController.getTheft.bind(UsageController));

// Base routes from BaseController
router.post('/', UsageController.create.bind(UsageController)); // Create usage
router.get('/', UsageController.find.bind(UsageController)); // Get all usage records
router.get('/:id', UsageController.findOne.bind(UsageController)); // Get usage by ID
router.put('/:id', UsageController.update.bind(UsageController)); // Update usage
router.delete('/:id', UsageController.delete.bind(UsageController)); // Delete usage

// Custom route: Get usage by organization
router.get('/org/:orgId', UsageController.getUsageByOrg.bind(UsageController)); // Find usage by organization

module.exports = router;
