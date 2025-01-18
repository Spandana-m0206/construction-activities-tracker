const mongoose = require('mongoose');
const extendSchema = require('../base/BaseModel');
const { OrderStatuses, OrderPriorities } = require('../../utils/enums'); // Enums for statuses and priorities
const enumToArray = require('../../utils/EnumToArray');

// Define Order-specific fields
const orderFields = {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User
    site: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', default: null }, // Nullable reference to Site
    inventory: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', default: null }, // Nullable reference to Inventory
    fromInventory: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', default: null }, // Nullable reference to Inventory
    fromSite: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', default: null }, // Nullable reference to Site
    status: { type: String, enum: enumToArray(OrderStatuses), required: true, default: OrderStatuses.IN_TRANSIT}, // Enum for statuses
    org: { type: mongoose.Schema.Types.ObjectId, ref: 'Org', required: true }, // Reference to Org
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null }, // Nullable reference to Task
    materials: [
        {
            material: { type: mongoose.Schema.Types.ObjectId, ref: 'MaterialMetadata', required: true }, // Reference to Material
            quantity: { type: Number, required: true },
        },
    ],
    priority: { type: String, enum: enumToArray(OrderPriorities), required: true }, // Enum for priorities
    approvedOn: { type: Date, required: false }, // Nullable
    dispatchedOn: { type: Date, required: false }, // Nullable
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fulfillment: { type: [mongoose.Schema.Types.ObjectId], ref: 'RequestFulfillment', required: true},
    fulfilledMaterials: [
        {
            material: { type: mongoose.Schema.Types.ObjectId, ref: 'MaterialMetadata' },
            quantity: { type: Number, required: true }
        }
    ],
};

// Create the extended schema
const orderSchema = extendSchema(orderFields);

// Create and export the Mongoose model
const OrderModel = mongoose.model('Order', orderSchema);

module.exports = OrderModel;
