const mongoose = require('mongoose');
const extendSchema = require('../base/BaseModel');
const { CountryCodes } = require('../../utils/enums');

// Define Vendor-specific fields
const vendorFields = {
    name: { type: String, required: true },
    contact: { type: Number, required: true },
    countryCode: { type: String, enum: CountryCodes, required: true },
    address: { type: String, required: true },
    org: { type: mongoose.Schema.Types.ObjectId, ref: 'Org', required: true }, // Reference to Org
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User
};

// Create the extended schema
const vendorSchema = extendSchema(vendorFields);

// Create and export the Mongoose model
const VendorModel = mongoose.model('Vendor', vendorSchema);

module.exports = VendorModel;
