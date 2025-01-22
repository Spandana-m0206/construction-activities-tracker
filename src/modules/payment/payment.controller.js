const mongoose = require('mongoose');
const BaseController = require('../base/BaseController');
const PaymentService = require('./payment.service');
const { PaymentStatuses } = require('../../utils/enums');

class PaymentController extends BaseController {
    constructor() {
        super(PaymentService); 
    }

    async createPayment(req, res) {
        try {
            const { purchaseAllocations, paymentData } = req.body;

            // Basic input validation
            if (!purchaseAllocations || !Array.isArray(purchaseAllocations) || purchaseAllocations.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'purchaseAllocations must be a non-empty array.'
                });
            }
            if (!paymentData || typeof paymentData !== 'object') {
                return res.status(400).json({
                    success: false,
                    message: 'paymentData must be provided.'
                });
            }

            // Create the payment in `pending` status
            const payment = await PaymentService.createPayment(purchaseAllocations, paymentData);

            return res.status(201).json({ success: true, payment });
        } catch (error) {
            console.error('Error creating payment:', error);
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    async approvePayment(req, res) {
        try {
            const { paymentId } = req.params;

            // Validate paymentId format
            if (!mongoose.Types.ObjectId.isValid(paymentId)) {
                return res.status(400).json({ success: false, message: 'Invalid paymentId.' });
            }

            const payment = await PaymentService.approvePayment(paymentId);

            return res.status(200).json({ success: true, payment });
        } catch (error) {
            console.error('Error approving payment:', error);
            return res.status(400).json({ success: false, message: error.message });
        }
    }
}

module.exports = new PaymentController();
