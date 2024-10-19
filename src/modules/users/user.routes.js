const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
// const { protect } = require('../middleware/authMiddleware');
const casbinMiddleware = require('../../middlewares/casbinMiddleware');
// Public routes
router.post('/register', userController.registerUser);        // Register a new user
router.post('/login', userController.loginUser);              // User login
router.post('/forgot-password', userController.forgotPassword); // Forgot password
router.post('/reset-password', userController.resetPassword);   // Reset password

// // Protected routes (Require JWT)
// router.get('/profile', protect, userController.getUserProfile); // Get user profile
// router.put('/:id', protect, userController.updateUser);         // Update user (admin)

// Soft delete (protected)
router.patch('/:id/deactivate', userController.softDeleteUser);
router.patch('/:id/update', userController.updateUser);

// Bulk delete (protected)
router.patch('/bulk-delete', userController.bulkDeleteUsersByProject);

module.exports = router;
