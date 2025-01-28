// purchase.model.js
const mongoose = require('mongoose');
const extendSchema = require('../base/BaseModel');

// Define Purchase-specific fields
const purchaseFields = {
    purchasedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    attachment: { type: mongoose.Schema.Types.ObjectId, ref: 'File', required: false, default: null },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, default: null },
    materialListItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MaterialListItem', required: false }],
    payments: [{
        paymentId:{type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: false, default: null} , 
        amount : {type: Number, required: true}
    }],
    purchaseRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseRequest', required: true }],
    org: { type: mongoose.Schema.Types.ObjectId, ref: 'Org', required: true }, // Reference to Org
};

// Create the extended schema
const purchaseSchema = extendSchema(purchaseFields);

// Create and export the Mongoose model
const PurchaseModel = mongoose.model('Purchase', purchaseSchema);

module.exports = PurchaseModel;
