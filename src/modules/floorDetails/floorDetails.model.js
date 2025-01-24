const mongoose = require('mongoose');
const extendSchema = require('../base/BaseModel');
const { CarpetAreaUnitType, FloorTypes, SiteTypes } = require('../../utils/enums');
const enumToArray = require('../../utils/EnumToArray');

// Define Floor Details-specific fields
const floorDetailsFields = {
    site: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true }, // Reference to Site
    floorNumber: { type: String, required: true }, // Floor Number
    balconies: { type: Number, required: true }, // Number of Balconies
    size: { type: String, enum: enumToArray(SiteTypes), required: true }, // Floor Size
    level: { type: Number, required: true }, // Level of the floor
    type: { type: String, enum: enumToArray(FloorTypes), required: true }, // Floor Type
    washrooms: { type: Number, required: true }, // Number of Washrooms
    carpetArea: { type: Number, required: true }, // Carpet Area
    carpetAreaUnit: { type: String, enum: enumToArray(CarpetAreaUnitType), required: true }, // Unit for Carpet Area
    isParking: { type: Boolean, required: true }, // Parking Availability
    isBasement: { type: Boolean, required: true }, // Basement Availability
    isStore: { type: Boolean, required: true }, // Store Room Availability
    doorCount: { type: Number, required: true }, // Number of Doors
    windowCount: { type: Number, required: true }, // Number of Windows
    floorHeight: { type: Number, required: true }, // Floor Height
    wallCount: { type: Number, required: true }, // Number of Walls
    coveredArea: { type: Number, required: true }, // Covered Area
    floorSizeInGz: { type: Number, required: true }, // Floor Size in GZ
    comment: { type: String, default: null }, // Comments
    numberOfPillars: { type: Number, required: true }, // Number of Pillars
};

// Create the extended schema
const floorDetailsSchema = extendSchema(floorDetailsFields);

// Create and export the Mongoose model
const FloorDetailsModel = mongoose.model('FloorDetails', floorDetailsSchema);

module.exports = FloorDetailsModel;
