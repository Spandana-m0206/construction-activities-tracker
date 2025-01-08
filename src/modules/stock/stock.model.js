const mongoose = require('mongoose');
const extendSchema = require('../base/BaseModel');
const { StockSources } = require('../../utils/enums'); // Enum for stock sources
const enumToArray = require('../../utils/EnumToArray');

// Define Stock-specific fields
const stockItemFields = {
    site: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', default: null }, // Nullable reference to Site
    material: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'MaterialListItem', required: true }, // Array of Materials
    ],
    inventory: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', default: null }, // Nullable reference to Inventory
    org: { type: mongoose.Schema.Types.ObjectId, ref: 'Org', required: true }, // Reference to Organization
    source: { type: String, enum: enumToArray(StockSources), required: true }, // Enum for source (inventory/site)
    materialMetaData: { type: mongoose.Schema.Types.ObjectId, ref: 'MaterialMetadata', required: true }
};

// Create the extended schema
const stockItemSchema = extendSchema(stockItemFields);

// Create and export the Mongoose model
const StockItemModel = mongoose.model('Stock', stockItemSchema);

module.exports = StockItemModel;
