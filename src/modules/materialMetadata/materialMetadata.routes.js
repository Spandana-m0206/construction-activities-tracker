const express = require('express');
const MaterialMetadataController = require('./materialMetadata.controller');
const upload = require('../file/file.storage');

const router = express.Router();

// Base routes from BaseController
router.post('/', MaterialMetadataController.create.bind(MaterialMetadataController)); // Create material metadata
router.post('/create-bulk',upload.single('file'), MaterialMetadataController.createMaterialInBulk.bind(MaterialMetadataController)); // Create material metadata

router.get('/', MaterialMetadataController.find.bind(MaterialMetadataController)); // Get all materials
router.get('/:id', MaterialMetadataController.findOne.bind(MaterialMetadataController)); // Get material by ID
router.put('/:id', MaterialMetadataController.update.bind(MaterialMetadataController)); // Update material
router.delete('/:id', MaterialMetadataController.delete.bind(MaterialMetadataController)); // Delete material

// Custom route: Get materials by category
router.get('/category/:category', MaterialMetadataController.getMaterialsByCategory.bind(MaterialMetadataController)); // Find materials by category

module.exports = router;
