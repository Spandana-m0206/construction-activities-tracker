const mongoose = require('mongoose');

// Define common fields
const baseFields = {
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, // Automatically generated MongoDB ObjectId
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
};

// A utility function to extend schemas with base fields
const extendSchema = (schemaDefinition) => {
    return new mongoose.Schema(
        {
            ...baseFields,
            ...schemaDefinition,
        },
        {
            timestamps: true, // Automatically handle `createdAt` and `updatedAt`
        }
    );
};

module.exports = extendSchema;
