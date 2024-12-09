const express = require('express');
const UserController = require('./user.controller');

const router = express.Router();

// Base routes from BaseController
router.post('/', UserController.create.bind(UserController)); // Create user
router.get('/', UserController.find.bind(UserController)); // Get all users
router.get('/:id', UserController.findOne.bind(UserController)); // Get user by ID
router.put('/:id', UserController.update.bind(UserController)); // Update user
router.delete('/:id', UserController.delete.bind(UserController)); // Delete user

// Custom route: Get users by role
router.get('/role/:role', UserController.getUsersByRole.bind(UserController)); // Find users by role

module.exports = router;
