const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Define User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['admin', 'site_supervisor', 'labourer'], 
        required: true 
    },
    position: { type: String }, // carpenter, electrician, etc.
    isActive: { type: Boolean, default: true },
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }, 
    projectIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Password hashing middleware
userSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or it's new)
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        console.log("Hashed password saved to DB:", this.password);  // Log the hashed password
        next();
    } catch (error) {
        next(error);
    }
});


// Method to check password during login
userSchema.methods.comparePassword = async function (candidatePassword) {
    console.log("Candidate password (entered by user):", candidatePassword);
    console.log("Hashed password (stored in DB):", this.password);
    return bcrypt.compare(candidatePassword, this.password);
};


// Method to generate password reset token
userSchema.methods.generatePasswordResetToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash the token and set expiration time
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 3600000; // Token expires in 1 hour

    return resetToken; // Return raw token (unhashed) for sending to the user
};

// Method to check if password reset token is valid
userSchema.methods.isPasswordResetTokenValid = function () {
    return this.passwordResetExpires && this.passwordResetExpires > Date.now();
};

// Middleware to automatically update 'updatedAt' before saving
userSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('User', userSchema);
