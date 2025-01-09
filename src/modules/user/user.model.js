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
    resetOTP: { type: String, default: null },
    resetOTPExpiry: { type: Date, default: null },
    isActive: { type: Boolean, required: true, default: true },
    refreshToken:{type:String},
    profilePhoto: { type:mongoose.Schema.Types.ObjectId, ref: 'File', required: false },
};

// Create the extended schema
const userSchema = extendSchema(userFields);

userSchema.pre('save', async function (next){
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, parseInt(process.env.SALTS) )
    }
    if(this.isModified('email')){
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

userSchema.methods.generatePasswordResetOTP = function () {
    this.resetOTP = Math.floor(1000 + Math.random() * 9000).toString();
    this.resetOTPExpiry = Date.now() + 3600000 // 1 hour
} 

userSchema.methods.verifyPasswordResetToken = function (token) {
    return this.resetToken === token && this.resetTokenExpiry > Date.now();
};

userSchema.methods.verifyPasswordResetOTP = function (otp) {
    return this.resetOTP === otp && this.resetOTPExpiry > Date.now();
};

// Create and export the Mongoose model
const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;
