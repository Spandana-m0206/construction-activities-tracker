const mongoose = require('mongoose');
const extendSchema = require('../base/BaseModel');
const { MaterialCategories, Units } = require('../../utils/enums'); // Enums for category and units

// Define Material Metadata-specific fields
const materialMetadataFields = {
    name: { type: String, required: true },
    category: { type: String, enum: MaterialCategories, required: true }, // Enum for categories
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User
    units: { type: String, enum: Units, required: true }, // Enum for units
    org: { type: mongoose.Schema.Types.ObjectId, ref: 'Org', required: true }, // Reference to Org
    // priceHistory: [
    //     {
    //         price: { type: Number },
    //         updatedOn: { type: Date, default: Date.now },
    //     },
    // ],
    // currentPrice: { type: Number },
};

// Create the extended schema
const materialMetadataSchema = extendSchema(materialMetadataFields);

// Create and export the Mongoose model
const MaterialMetadataModel = mongoose.model('MaterialMetadata', materialMetadataSchema);

module.exports = MaterialMetadataModel;
