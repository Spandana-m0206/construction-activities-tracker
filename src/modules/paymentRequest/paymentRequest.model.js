const mongoose = require('mongoose');
const extendSchema = require('../base/BaseModel');
const { PaymentRequestTypes } = require('../../utils/enums'); // Enums for payment request types

// Define Payment Request-specific fields
const paymentRequestFields = {
    amount: { type: Number, required: true }, // Payment request amount
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User who raised the request
    raisedOn: { type: Date, required: true }, // Date when the request was raised
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // User who approved the request
    approvedOn: { type: Date, default: null }, // Date when the request was approved
    comment: { type: String, default: null }, // Optional comment
    attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File', default: [] }], // Array of attachments
    type: { type: String, enum: PaymentRequestTypes, required: true }, // Type of payment request (credit/debit)
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null }, // Optional reference to a task
    payments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true }], // Array of Payment references
};

// Create the extended schema
const paymentRequestSchema = extendSchema(paymentRequestFields);

// Create and export the Mongoose model
const PaymentRequestModel = mongoose.model('PaymentRequest', paymentRequestSchema);

module.exports = PaymentRequestModel;
