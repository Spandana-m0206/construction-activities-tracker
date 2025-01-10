const express = require('express');
const ReactionController = require('./reaction.controller');

const router = express.Router();
 
router.post('/:messageId', ReactionController.create.bind(ReactionController)); // Create message
  

module.exports = router;
