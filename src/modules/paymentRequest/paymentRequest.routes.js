const express = require('express');
const PaymentRequestController = require('./paymentRequest.controller');

const router = express.Router();

// Base routes from BaseController
router.post('/', PaymentRequestController.create.bind(PaymentRequestController)); // Create payment request
router.get('/', PaymentRequestController.find.bind(PaymentRequestController)); // Get all payment requests
router.get('/:id', PaymentRequestController.findOne.bind(PaymentRequestController)); // Get payment request by ID
router.put('/:id', PaymentRequestController.update.bind(PaymentRequestController)); // Update payment request
router.delete('/:id', PaymentRequestController.delete.bind(PaymentRequestController)); // Delete payment request

// Custom route: Get payment requests by user
router.get('/user/:userId', PaymentRequestController.getPaymentRequestsByUser.bind(PaymentRequestController)); // Find payment requests by user

module.exports = router;
