const express = require('express');
const AuthController = require('./auth.controller');

const router = express.Router();

router.post('/login', AuthController.login); // Login User

router.post('/forgot-password', AuthController.forgotPassword); // Forgot Password

router.post('/reset-password', AuthController.resetPassword); // Reset Password
router.post('/verify-otp',AuthController.verifyOTP); //verify otp
router.post('/refresh-access-token',AuthController.refreshAccessToken);

module.exports = router;
