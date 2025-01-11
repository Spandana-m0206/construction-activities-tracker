const mongoose = require('mongoose');
const extendSchema = require('../base/BaseModel');
 
// Define Message-specific fields
const reactionFields = {
    reaction: { type: String, default: null }, // Content of the message
   
    reactedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Reference to User
    message:{type:mongoose.Schema.Types.ObjectId, ref:'Message'},
};

// Create the extended schema
const reactionSchema = extendSchema(reactionFields);

// Create and export the Mongoose model
const ReactionModel = mongoose.model('Reaction', reactionSchema);

module.exports = ReactionModel;
