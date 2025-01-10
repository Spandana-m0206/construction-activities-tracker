const express = require('express');
const MessageController = require('./message.controller');

const router = express.Router();

// Base routes from BaseController
router.post('/:siteId', MessageController.create.bind(MessageController)); // Create message
router.get('/', MessageController.find.bind(MessageController)); // Get all messages
router.get('/:siteId', MessageController.getMessageBySiteId.bind(MessageController)); // Get message by site ID
router.put('/:id', MessageController.update.bind(MessageController)); // Update message
router.delete('/:messageId', MessageController.delete.bind(MessageController)); // Delete message


// Custom route: Get messages by organization
router.get('/org/:orgId', MessageController.getMessagesByOrg.bind(MessageController)); // Find messages by organization

module.exports = router;
