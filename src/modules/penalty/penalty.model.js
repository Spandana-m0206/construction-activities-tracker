const mongoose = require('mongoose');
const extendSchema = require('../base/BaseModel');
const { PenaltySources } = require('../../utils/enums'); // Enums for penalty sources

// Define Penalty-specific fields
const penaltyFields = {
    amount: { type: Number, required: true }, // Penalty amount
    person: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User receiving the penalty
    penaltyBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User issuing the penalty
    remark: { type: String, required: true }, // Remark explaining the penalty
    source: { type: String, enum: PenaltySources, required: true }, // Source of the penalty
    site: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true }, // Reference to Site
    org: { type: mongoose.Schema.Types.ObjectId, ref: 'Org', required: true }, // Reference to Organization
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User who approved the penalty
    approvedAt: { type: Date, required: true }, // Approval date
};

// Create the extended schema
const penaltySchema = extendSchema(penaltyFields);

// Create and export the Mongoose model
const PenaltyModel = mongoose.model('Penalty', penaltySchema);

module.exports = PenaltyModel;
