const mongoose = require('mongoose');
const extendSchema = require('../base/BaseModel');

// Define Inventory-specific fields
const inventoryFields = {
    name: { type: String, required: true },
    address: { type: String, required: true },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User
    org: { type: mongoose.Schema.Types.ObjectId, ref: 'Org', required: true }, // Reference to User
};

// Create the extended schema
const inventorySchema = extendSchema(inventoryFields);

// Create and export the Mongoose model
const InventoryModel = mongoose.model('Inventory', inventorySchema);

module.exports = InventoryModel;
