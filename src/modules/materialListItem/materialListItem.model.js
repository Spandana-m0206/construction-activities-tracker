const mongoose = require('mongoose');
const extendSchema = require('../base/BaseModel');

// Define Material List Item-specific fields
const materialListItemFields = {
    materialMetadata: { type: mongoose.Schema.Types.ObjectId, ref: 'MaterialMetadata', required: true }, // Reference to Material Metadata
    price: { type: Number, required: true }, // Price of the material
    purchaseDetails: { type: mongoose.Schema.Types.ObjectId, ref: 'Purchase', required: false,  default: null  }, // Reference to Purchase
    qty: { type: Number, required: true }, // Quantity of the material
    org: { type: mongoose.Schema.Types.ObjectId, ref: 'Org', required: true }, // Reference to Org
};

// Create the extended schema
const materialListItemSchema = extendSchema(materialListItemFields);

// Create and export the Mongoose model
const MaterialListItemModel = mongoose.model('MaterialListItem', materialListItemSchema);

module.exports = MaterialListItemModel;
