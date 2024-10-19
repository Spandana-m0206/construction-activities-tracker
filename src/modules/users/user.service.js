const User = require('./user.model');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';
const JWT_EXPIRES_IN = '1h'; // Token expiration time

// User Registration
exports.registerUser = async (userData) => {
    const { name, email, phone, password, role } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error('Email already in use');

    // Create new user
    const user = new User({ name, email, phone, password, role });
    return await user.save();
};

// User Login
exports.loginUser = async (email, password) => {
    try {
        const user = await User.findOne({ email });
        
        if (!user) {
            console.log("User not found with email:", email);
            throw new Error('Invalid email or password');
        }

        if (!user.isActive) {
            console.log("User is deactivated:", user.email);
            throw new Error('User is deactivated');
        }

        // Compare entered password with hashed password in DB

        const isMatch = await user.comparePassword(password); // Compare passwords

        if (!isMatch) throw new Error('Invalid email or password');

        // If passwords match, generate JWT token
        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        });

        return { user, token };
    } catch (error) {
        console.error(error.message);
        throw new Error('Login failed. Please check your credentials.');
    }
};


// Middleware to verify JWT
exports.verifyToken = async (token) => {
    try {
        return jwt.verify(token, JWT_SECRET); // Returns the decoded token if valid
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

// Forgot Password
exports.forgotPassword = async (email) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found');
    const resetToken = Math.floor(1000 + Math.random() * 9000); 
    user.passwordResetToken = resetToken
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    // You would normally send the resetToken via email/phone here
    return resetToken;
};

// Reset Password
exports.resetPassword = async (resetToken, newPassword) => {
    const user = await User.findOne({
        passwordResetToken: resetToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) throw new Error('Invalid or expired token');

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();
};

// Change Password
exports.changePassword = async (userId, oldPassword, newPassword) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new Error('Incorrect old password');

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
};

// Soft Delete User
exports.softDeleteUser = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    
    user.isActive = false;
    await user.save();
};

// Bulk Delete Users by Project IDs
exports.bulkDeleteUsersByProject = async (projectIds) => {
    return await User.updateMany(
        { projectIds: { $in: projectIds } },
        { $set: { isActive: false } }
    );
};

// Update User
exports.updateUser = async (userId, updates) => {
    const user = await User.findByIdAndUpdate(userId, updates, { new: true });
    if (!user) throw new Error('User not found');
    return user;
};
