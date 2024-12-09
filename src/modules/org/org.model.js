const mongoose = require('mongoose');
const extendSchema = require('../base/BaseModel');

// Define org-specific fields
const orgFields = {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, match: /^\S+@\S+\.\S+$/ },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    address: { type: String, default: null },
};

// Create the extended schema
const orgSchema = extendSchema(orgFields);

// Create and export the Mongoose model
const OrgModel = mongoose.model('Org', orgSchema);

module.exports = OrgModel;