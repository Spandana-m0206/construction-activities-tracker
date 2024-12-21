const mongoose = require('mongoose');
const extendSchema = require('../base/BaseModel');
const { StockSources } = require('../../utils/enums'); // Enum for stock sources

// Define Stock-specific fields
const stockFields = {
    quantity: { type: Number, required: true }, // Quantity of the stock
    site: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', default: null }, // Nullable reference to Site
    material: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'MaterialMetadata', required: true }, // Array of Materials
    ],
    inventory: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', default: null }, // Nullable reference to Inventory
    org: { type: mongoose.Schema.Types.ObjectId, ref: 'Org', required: true }, // Reference to Organization
    source: { type: String, enum: StockSources, required: true }, // Enum for source (inventory/site)
};

// Create the extended schema
const stockSchema = extendSchema(stockFields);

// Create and export the Mongoose model
const StockModel = mongoose.model('Stock', stockSchema);

module.exports = StockModel;
