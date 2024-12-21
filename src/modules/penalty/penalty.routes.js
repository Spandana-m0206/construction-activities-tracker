const express = require('express');
const PenaltyController = require('./penalty.controller');

const router = express.Router();

// Base routes from BaseController
router.post('/', PenaltyController.create.bind(PenaltyController)); // Create penalty
router.get('/', PenaltyController.find.bind(PenaltyController)); // Get all penalties
router.get('/:id', PenaltyController.findOne.bind(PenaltyController)); // Get penalty by ID
router.put('/:id', PenaltyController.update.bind(PenaltyController)); // Update penalty
router.delete('/:id', PenaltyController.delete.bind(PenaltyController)); // Delete penalty

// Custom route: Get penalties by organization
router.get('/org/:orgId', PenaltyController.getPenaltiesByOrg.bind(PenaltyController)); // Find penalties by organization

module.exports = router;
