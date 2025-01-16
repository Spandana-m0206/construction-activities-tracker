const mongoose = require('mongoose');
const extendSchema = require('../base/BaseModel');
const { MessageTypes } = require('../../utils/enums');
const enumToArray = require('../../utils/EnumToArray');

// Define Message-specific fields
const messageFields = {
    content: { type: String, default: null }, // Content of the message
    attachment: { type: mongoose.Schema.Types.ObjectId, ref: 'File', default: null }, // Optional file attachment
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Reference to User
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null }, // Nullable reference to Task y
    site: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true }, // Reference to Site
    approvalRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'Approval', default: null }, // Nullable reference to Approval
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null }, // Nullable reference to Order material req
    paymentRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', default: null }, // Nullable reference to Payment Request
    org: { type: mongoose.Schema.Types.ObjectId, ref: 'Org', required: true }, // Reference to Org
    type: { type: String, enum: enumToArray(MessageTypes), required: true,default:MessageTypes.TEXT}, 
    taggedMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message'}, 
    isDeleted: { type: Boolean, required: true,default:false }, 
    
};

// Create the extended schema
const messageSchema = extendSchema(messageFields);

// Create and export the Mongoose model
const MessageModel = mongoose.model('Message', messageSchema);

module.exports = MessageModel;
