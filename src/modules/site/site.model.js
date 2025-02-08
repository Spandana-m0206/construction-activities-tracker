const mongoose = require('mongoose');
const extendSchema = require('../base/BaseModel');
const { ProjectCurrencies, SiteTypes, FloorTypes, SiteStatuses, LandType } = require('../../utils/enums'); // Enums
const  enumToArray = require('../../utils/EnumToArray');

// Define Site-specific fields
const siteFields = {
    name: { type: String, required: true },
    location: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: false },
    projectCurrency: { type: String, enum: enumToArray(ProjectCurrencies), required: true },
    projectValue: { type: Number, required: true },
    level: { type: Number, required: true },
    landType: { type: String, enum: LandType, required: true },
    floors: { type: Number, required: true },
    basements: { type: Number, required: true },
    supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User
    org: { type: mongoose.Schema.Types.ObjectId, ref: 'Org', required: true }, // Reference to Org
    status: { type: String, enum: enumToArray(SiteStatuses), required: true },
};

// Create the extended schema
const siteSchema = extendSchema(siteFields);

// Create and export the Mongoose model
const SiteModel = mongoose.model('Site', siteSchema);

module.exports = SiteModel;
