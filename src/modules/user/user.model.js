const mongoose = require('mongoose');
const extendSchema = require('../base/BaseModel');
const { CountryCodes, Roles, Languages } = require('../../utils/enums'); // Enums for validation
const bcrypt = require('bcrypt');
const  enumToArray  = require('../../utils/EnumToArray');
// Define User-specific fields
const userFields = {
    name: { type: String, required: true },
    countryCode: { type: String, enum: CountryCodes, required: true },
    phone: { type: Number, required: true },
    email: { type: String, required: true, unique: true, match: /^\S+@\S+\.\S+$/ },
    password: { type: String, required: true },
    role: { type: String, enum: enumToArray(Roles), required: true },
    org: { type: mongoose.Schema.Types.ObjectId, ref: 'Org', required: false }, // Reference to Org
    language: { type: String, enum: Languages, required: true },
    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null },
    isActive: { type: Boolean, required: true, default: true },
};

// Create the extended schema
const userSchema = extendSchema(userFields);

userSchema.pre('save', async function (next){
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, parseInt(process.env.SALTS) )
    }
    if(this.email){
        this.email = this.email.toLowerCase().trim();
    }
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generatePasswordResetToken = function () {
    this.resetToken = Math.random().toString(36).slice(-8)
    this.resetTokenExpiry = Date.now() + 3600000 // 1 hour
} 

// Create and export the Mongoose model
const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;
