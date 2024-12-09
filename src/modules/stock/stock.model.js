const mongoose = require('mongoose');
const extendSchema = require('../base/BaseModel');

// Define Stock-specific fields
const stockFields = {
    quantity: { type: Number, required: true },
    site: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', default: null }, // Nullable reference to Site
    material: { type: mongoose.Schema.Types.ObjectId, ref: 'MaterialMetadata', required: true }, // Reference to MaterialMetadata
    inventory: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', default: null }, // Nullable reference to Inventory
    org: { type: mongoose.Schema.Types.ObjectId, ref: 'Org', required: true }, // Reference to Org
};

// Create the extended schema
const stockSchema = extendSchema(stockFields);

// Create and export the Mongoose model
const StockModel = mongoose.model('Stock', stockSchema);

module.exports = StockModel;
