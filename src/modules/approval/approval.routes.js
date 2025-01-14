const express = require('express');
const ApprovalController = require('./approval.controller');
const upload = require('../file/file.storage');
const router = express.Router();

// Base routes from BaseController
router.post('/', upload.array('files'), ApprovalController.create.bind(ApprovalController)); // Create approval
router.get('/', ApprovalController.find.bind(ApprovalController)); // Get all approvals
router.get('/:id', ApprovalController.findOne.bind(ApprovalController)); // Get approval by ID
router.put('/:id', ApprovalController.update.bind(ApprovalController)); // Update approval
router.delete('/:id', ApprovalController.delete.bind(ApprovalController)); // Delete approval

// Custom route: Get approvals by site
router.get('/site/:siteId', ApprovalController.getApprovalsBySite.bind(ApprovalController)); // Find approvals by site
router.post(
    '/:id/images',
    upload.array('files'),
    ApprovalController.uploadImages.bind(ApprovalController)
);

module.exports = router;
