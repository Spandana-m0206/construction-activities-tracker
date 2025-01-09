const express = require('express');
const SiteController = require('./site.controller');

const router = express.Router();

// Base routes from BaseController
router.post('/', SiteController.create.bind(SiteController)); // Create site
router.get('/', SiteController.find.bind(SiteController)); // Get all sites
router.get('/:id', SiteController.findOne.bind(SiteController)); // Get site by ID
router.put('/:site', SiteController.update.bind(SiteController)); // Update site
router.delete('/:id', SiteController.delete.bind(SiteController)); // Delete site

// Custom route: Get sites by status
router.get('/status/:status', SiteController.getSitesByStatus.bind(SiteController)); // Find sites by status
router.get('/progress/:siteId', SiteController.getSiteProgress.bind(SiteController));

module.exports = router;
