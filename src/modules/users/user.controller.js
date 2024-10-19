const userService = require('./user.service');

// User Registration
exports.registerUser = async (req, res) => {
    try {
        const user = await userService.registerUser(req.body);
        res.status(201).json({ message: 'User registered successfully!', user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// User Login
exports.loginUser = async (req, res) => {
    try {
        const { user, token } = await userService.loginUser(req.body.email, req.body.password);
        res.json({ message: 'Login successful', user, token });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
    try {
        const token = await userService.forgotPassword(req.body.email);
        res.json({ message: `Password reset token: ${token}` });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    try {
        await userService.resetPassword(req.body.token, req.body.newPassword);
        res.json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Change Password
exports.changePassword = async (req, res) => {
    try {
        await userService.changePassword(req.user.id, req.body.oldPassword, req.body.newPassword);
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Soft Delete User
exports.softDeleteUser = async (req, res) => {
    try {
        await userService.softDeleteUser(req.params.id);
        res.json({ message: 'User deactivated successfully' });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

// Bulk Delete Users by Project IDs
exports.bulkDeleteUsersByProject = async (req, res) => {
    try {
        const result = await userService.bulkDeleteUsersByProject(req.body.projectIds);
        res.json({ message: 'Users deactivated successfully', result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update User
exports.updateUser = async (req, res) => {
    try {
        const user = await userService.updateUser(req.params.id, req.body);
        res.json({ message: 'User updated successfully', user });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};
