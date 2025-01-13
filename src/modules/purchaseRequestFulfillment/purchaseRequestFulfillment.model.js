// purchaseRequestFulfillment.model.js
const mongoose = require('mongoose');
const extendSchema = require('../base/BaseModel');
const { FulfillmentStatuses } = require('../../utils/enums'); // Ensure this enum exists
const enumToArray = require('../../utils/EnumToArray');

// Define Purchase Request Fulfillment-specific fields
const purchaseRequestFulfillmentFields = {
    purchaseRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseRequest', required: true },
    materialFulfilled: [
        {
            material: { type: mongoose.Schema.Types.ObjectId, ref: 'MaterialMetadata', required: true },
            quantity: { type: Number, required: true },
        },
    ],
    fulfilledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fulfilledOn: { type: Date, required: true },
    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // Made optional
    receivedOn: { type: Date, required: false }, // Made optional
    status: { type: String, enum: enumToArray(FulfillmentStatuses), required: true },
};

// Create the extended schema
const purchaseRequestFulfillmentSchema = extendSchema(purchaseRequestFulfillmentFields);

// Create and export the Mongoose model
const PurchaseRequestFulfillmentModel = mongoose.model('PurchaseRequestFulfillment', purchaseRequestFulfillmentSchema);

module.exports = PurchaseRequestFulfillmentModel;
