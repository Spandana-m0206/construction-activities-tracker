const mongoose = require('mongoose');
const extendSchema = require('../base/BaseModel');

// Define File-specific fields
const fileFields = {
    filename: { type: String, required: true }, // Stored filename
    type: { type: String, required: true }, // File type (MIME type)
    size: { type: Number, required: true }, // File size in bytes
    org: { type: mongoose.Schema.Types.ObjectId, ref: 'Org', required: true }, // Reference to Org
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User
    url: { type: String, required: true }, // File access URL
};

// Create the extended schema
const fileSchema = extendSchema(fileFields);

// Create and export the Mongoose model
const FileModel = mongoose.model('File', fileSchema);

module.exports = FileModel;
