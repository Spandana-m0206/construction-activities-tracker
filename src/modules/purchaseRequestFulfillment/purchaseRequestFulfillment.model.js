const mongoose = require('mongoose');
const extendSchema = require('../base/BaseModel');
const { FulfillmentStatuses } = require('../../utils/enums'); // Enum for statuses

// Define Purchase Request Fulfillment-specific fields
const purchaseRequestFulfillmentFields = {
    purchaseRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseRequest', required: true }, // Reference to Purchase Request
    materialFulfilled: [
        {
            material: { type: mongoose.Schema.Types.ObjectId, ref: 'MaterialMetadata', required: true }, // Reference to Material
            quantity: { type: Number, required: true }, // Quantity fulfilled
        },
    ], // Array of material items fulfilled
    fulfilledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User
    fulfilledOn: { type: Date, required: true }, // Fulfillment date
    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User
    receivedOn: { type: Date, required: true }, // Received date
    status: { type: String, enum: FulfillmentStatuses, required: true }, // Enum for fulfillment status
};

// Create the extended schema
const purchaseRequestFulfillmentSchema = extendSchema(purchaseRequestFulfillmentFields);

// Create and export the Mongoose model
const PurchaseRequestFulfillmentModel = mongoose.model('PurchaseRequestFulfillment', purchaseRequestFulfillmentSchema);

module.exports = PurchaseRequestFulfillmentModel;
