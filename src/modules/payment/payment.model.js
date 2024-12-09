const mongoose = require('mongoose');
const extendSchema = require('../base/BaseModel');
const { PaymentPriorities, PaymentStatuses } = require('../../utils/enums'); // Enums for priority and status

// Define Payment-specific fields
const paymentFields = {
    priority: { type: String, enum: PaymentPriorities, required: true }, // Enum for priorities
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User
    inventory: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', default: null }, // Nullable reference to Inventory
    site: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', default: null }, // Nullable reference to Site
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Nullable reference to User
    status: { type: String, enum: PaymentStatuses, required: true }, // Enum for statuses
    amount: { type: Number, required: true }, // Payment amount
    org: { type: mongoose.Schema.Types.ObjectId, ref: 'Org', required: true }, // Reference to Org
    inventoryRequest: [
        {
            material: { type: mongoose.Schema.Types.ObjectId, ref: 'MaterialMetadata', required: true }, // Reference to Material
            qty: { type: Number, required: true },
            price: { type: Number, required: true },
        },
    ],
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: false }, // Nullable Reference to Vendor
};

// Create the extended schema
const paymentSchema = extendSchema(paymentFields);

// Create and export the Mongoose model
const PaymentModel = mongoose.model('Payment', paymentSchema);

module.exports = PaymentModel;
