const express = require('express');
const PaymentController = require('./payment.controller');

const router = express.Router();

// Base routes from BaseController
router.post('/', PaymentController.create.bind(PaymentController)); // Create payment
router.get('/', PaymentController.find.bind(PaymentController)); // Get all payments
router.get('/:id', PaymentController.findOne.bind(PaymentController)); // Get payment by ID
router.put('/:id', PaymentController.update.bind(PaymentController)); // Update payment
router.delete('/:id', PaymentController.delete.bind(PaymentController)); // Delete payment

// Custom route: Get payments by organization
router.get('/org/:orgId', PaymentController.getPaymentsByOrg.bind(PaymentController)); // Find payments by organization

module.exports = router;
