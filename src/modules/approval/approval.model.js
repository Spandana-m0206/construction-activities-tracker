const mongoose = require('mongoose');
const extendSchema = require('../base/BaseModel');
const enumToArray = require('../../utils/EnumToArray');
const { ApprovalStatuses, ApprovalTypes } = require('../../utils/enums'); // Enums for statuses and types

// Define Approval-specific fields
const approvalFields = {
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true }, // Reference to Task
    status: { type: String, enum: enumToArray(ApprovalStatuses), required: true }, // Enum for statuses
    images: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File', required: true }], // Array of file references
    site: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true }, // Reference to Site
    org: { type: mongoose.Schema.Types.ObjectId, ref: 'Org', required: true }, // Reference to Org
    type: { type: String, enum: enumToArray(ApprovalTypes), required: true }, // Enum for types
    progressPercentage: { type: Number, default: null }, // Nullable float percentage
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User
    approvedAt: { type: Date, default: Date.now()} // Reference to User
};

// Create the extended schema
const approvalSchema = extendSchema(approvalFields);

// Create and export the Mongoose model
const ApprovalModel = mongoose.model('Approval', approvalSchema);

module.exports = ApprovalModel;
