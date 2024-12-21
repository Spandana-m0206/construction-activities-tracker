const mongoose = require('mongoose');
const extendSchema = require('../base/BaseModel');
const { FulfillmentStatuses, TransferTypes } = require('../../utils/enums'); // Enums for statuses and transfer types

// Define Request Fulfillment-specific fields
const requestFulfillmentFields = {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true }, // Reference to Order
    materialList: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'MaterialListItem', required: true },
    ], // Array of Material List Items
    fulfilledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // User who fulfilled the request
    fulfilledOn: { type: Date, default: null }, // Fulfillment date
    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // User who received the request
    receivedOn: { type: Date, default: null }, // Received date
    status: { type: String, enum: FulfillmentStatuses, required: true }, // Status of fulfillment
    transferredFrom: { type: mongoose.Schema.Types.ObjectId, refPath: 'transferFromType', default: null }, // Source location (Site/Inventory)
    transferFromType: { type: String, enum: ['Site', 'Inventory'], required: false }, // Source type
    transferredTo: { type: mongoose.Schema.Types.ObjectId, refPath: 'transferToType', required: true }, // Destination location (Site/Inventory)
    transferToType: { type: String, enum: ['Site', 'Inventory'], required: true }, // Destination type
    transferType: { type: String, enum: TransferTypes, required: true }, // Type of transfer
};

// Create the extended schema
const requestFulfillmentSchema = extendSchema(requestFulfillmentFields);

// Create and export the Mongoose model
const RequestFulfillmentModel = mongoose.model('RequestFulfillment', requestFulfillmentSchema);

module.exports = RequestFulfillmentModel;
