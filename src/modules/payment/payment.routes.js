const express = require('express');
const PaymentController = require('./payment.controller');

const router = express.Router();

router.post('/create-payment', PaymentController.createPayment.bind(PaymentController)); // Create payment
router.post('/approve/:paymentId', PaymentController.approvePayment.bind(PaymentController)); // Create payment

// Base routes from BaseController
router.post('/', PaymentController.create.bind(PaymentController)); // Create payment
router.get('/', PaymentController.find.bind(PaymentController)); // Get all payments
router.get('/:id', PaymentController.findOne.bind(PaymentController)); // Get payment by ID
router.put('/:id', PaymentController.update.bind(PaymentController)); // Update payment
router.delete('/:id', PaymentController.delete.bind(PaymentController)); // Delete payment

module.exports = router;
