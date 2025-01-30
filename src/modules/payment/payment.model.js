const mongoose = require('mongoose');
const extendSchema = require('../base/BaseModel');
const { PaymentStatuses, PaymentMethods, PaymentTypes } = require('../../utils/enums'); // Enums for statuses, methods, and types
const enumToArray = require('../../utils/EnumToArray');

// Define Payment-specific fields
const paymentFields = {
    status: { type: String, enum: enumToArray(PaymentStatuses), required: true, default: PaymentStatuses.PENDING}, // Payment status
    amount: { type: Number, required: true }, // Payment amount
    attachment: { type: mongoose.Schema.Types.ObjectId, ref: 'File', default: null }, // Optional file attachment
    method: { type: String, enum: PaymentMethods, required: true }, // Payment method
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User who made the payment
    paidTo: { type: mongoose.Schema.Types.ObjectId, refPath: 'paidToModel', required: true }, // Reference to Vendor/User
    paidToModel: { type: String, enum: ['User', 'Vendor'], required: true }, // Dynamic reference type for `paidTo`
    comments: { type: String, default: null }, // Payment comments
    type: { type: String, enum: PaymentTypes, required: true , default: PaymentTypes.DEBIT}, // Payment type (credit/debit)
    paymentAllocation:[{
            purchaseId:{type: mongoose.Schema.Types.ObjectId, ref: 'Purchase', required: false, default: null} , 
            amount : {type: Number, required: true}
    }],
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default:null }, // User who made the payment
    approvedOn:{type: Date, default:null},
    org: { type: mongoose.Schema.Types.ObjectId, ref: 'Org', required: true }, // User who made the payment
};

// Create the extended schema
const paymentSchema = extendSchema(paymentFields);

// Create and export the Mongoose model
const PaymentModel = mongoose.model('Payment', paymentSchema);

module.exports = PaymentModel;
