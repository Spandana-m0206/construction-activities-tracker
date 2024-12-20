const mongoose = require('mongoose');
const extendSchema = require('../base/BaseModel');
const { PurchaseRequestPriorities, PurchaseRequestStatuses } = require('../../utils/enums'); // Enums for priorities and statuses

// Define Purchase Request-specific fields
const purchaseRequestFields = {
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User who raised the request
    inventory: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true }, // Reference to Inventory
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // User who approved the request
    approvedOn: { type: Date, required: false }, // Approval date
    materialList: [
        {
            material: { type: mongoose.Schema.Types.ObjectId, ref: 'MaterialMetadata', required: true }, // Material reference
            qty: { type: Number, required: true }, // Quantity of material
        },
    ], // Array of material items
    priority: { type: String, enum: PurchaseRequestPriorities, required: true }, // Priority of the request
    status: { type: String, enum: PurchaseRequestStatuses, required: true }, // Status of the request
};

// Create the extended schema
const purchaseRequestSchema = extendSchema(purchaseRequestFields);

// Create and export the Mongoose model
const PurchaseRequestModel = mongoose.model('PurchaseRequest', purchaseRequestSchema);

module.exports = PurchaseRequestModel;
