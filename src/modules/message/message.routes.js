const express = require('express');
const MessageController = require('./message.controller');

const router = express.Router();

// Base routes from BaseController
router.post('/', MessageController.create.bind(MessageController)); // Create message
router.get('/', MessageController.find.bind(MessageController)); // Get all messages
router.get('/:id', MessageController.findOne.bind(MessageController)); // Get message by ID
router.put('/:id', MessageController.update.bind(MessageController)); // Update message
router.delete('/:id', MessageController.delete.bind(MessageController)); // Delete message

// Custom route: Get messages by organization
router.get('/org/:orgId', MessageController.getMessagesByOrg.bind(MessageController)); // Find messages by organization

module.exports = router;
