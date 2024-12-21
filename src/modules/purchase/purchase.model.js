const mongoose = require('mongoose');
const extendSchema = require('../base/BaseModel');

// Define Purchase-specific fields
const purchaseFields = {
    purchasedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User who made the purchase
    amount: { type: Number, required: true }, // Total amount of the purchase
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true }, // Reference to Vendor
    attachment: { type: mongoose.Schema.Types.ObjectId, ref: 'File', required: true }, // Reference to attachment file
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User who approved the purchase
    payments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true }], // Array of Payment references
};

// Create the extended schema
const purchaseSchema = extendSchema(purchaseFields);

// Create and export the Mongoose model
const PurchaseModel = mongoose.model('Purchase', purchaseSchema);

module.exports = PurchaseModel;
