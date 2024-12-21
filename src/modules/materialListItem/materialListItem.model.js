const mongoose = require('mongoose');
const extendSchema = require('../base/BaseModel');

// Define Material List Item-specific fields
const materialListItemFields = {
    materialMetadata: { type: mongoose.Schema.Types.ObjectId, ref: 'MaterialMetadata', required: true }, // Reference to Material Metadata
    price: { type: Number, required: true }, // Price of the material
    purchaseDetails: { type: mongoose.Schema.Types.ObjectId, ref: 'Purchase', required: true }, // Reference to Purchase
    qty: { type: Number, required: true }, // Quantity of the material
};

// Create the extended schema
const materialListItemSchema = extendSchema(materialListItemFields);

// Create and export the Mongoose model
const MaterialListItemModel = mongoose.model('MaterialListItem', materialListItemSchema);

module.exports = MaterialListItemModel;
