const mongoose = require('mongoose');
const extendSchema = require('../base/BaseModel');
const { CountryCodes, Roles, Languages } = require('../../utils/enums'); // Enums for validation

// Define User-specific fields
const userFields = {
    name: { type: String, required: true },
    countryCode: { type: String, enum: CountryCodes, required: true },
    phone: { type: Number, required: true },
    email: { type: String, required: true, unique: true, match: /^\S+@\S+\.\S+$/ },
    password: { type: String, required: true },
    role: { type: String, enum: Roles, required: true },
    org: { type: mongoose.Schema.Types.ObjectId, ref: 'Org', required: true }, // Reference to Org
    language: { type: String, enum: Languages, required: true },
    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null },
    isActive: { type: Boolean, required: true, default: true },
};

// Create the extended schema
const userSchema = extendSchema(userFields);

// Create and export the Mongoose model
const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;
