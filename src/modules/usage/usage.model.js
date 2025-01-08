const mongoose = require('mongoose');
const extendSchema = require('../base/BaseModel');
const { UsageTypes } = require('../../utils/enums'); // Enum for usage types
const enumToArray = require('../../utils/EnumToArray');

// Define Usage-specific fields
const usageFields = {
    quantity: { type: Number, required: true }, // Quantity used/wasted/transferred
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null }, // Nullable reference to Task
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User
    site: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', default: null }, // Nullable reference to Site
    material: { type: mongoose.Schema.Types.ObjectId, ref: 'MaterialMetadata', required: true }, // Reference to Material
    type: { type: String, enum: enumToArray(UsageTypes), required: true }, // Enum for usage types
    org: { type: mongoose.Schema.Types.ObjectId, ref: 'Org', required: true }, // Reference to Org
    inventory: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', default: null }, // Nullable reference to Inventory
    toSite: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', default: null }, // Nullable reference to "To Site"
    toInventory: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', default: null }, // Nullable reference to "To Inventory"
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null }, // Nullable reference to Order
};

// Create the extended schema
const usageSchema = extendSchema(usageFields);

// Create and export the Mongoose model
const UsageModel = mongoose.model('Usage', usageSchema);

module.exports = UsageModel;
