const BaseService = require('../base/BaseService');
const UserModel = require('./user.model');

class UserService extends BaseService {
    constructor() {
        super(UserModel); // Pass the User model to the BaseService
    }

    // Example of a custom service method: Find users by role
    async findUsersByRole(role) {
        return await this.model.model.find({ role }).populate('org', 'name'); // Populate organization details
    }

    async forgotPassword(email) {
        const user = await this.model.findOne({ email: email.trim().toLowerCase() });
        if (!user) {
            throw new Error('User not found');
        }
        user.generatePasswordResetToken();
        await user.save();
        return user;
    }

    async resetPassword (email, newPassword, resetToken) {
        const user = await this.model.findOne({email, resetToken, resetTokenExpiry: {$gt: Date.now()}});
        if(!user){
            throw new Error('Invalid token or email');
        }
        user.password = newPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();
        return user;

    }
}

module.exports = new UserService();
