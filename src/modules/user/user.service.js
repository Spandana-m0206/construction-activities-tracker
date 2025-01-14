const { StatusCodes } = require('http-status-codes');
const { default: ApiError } = require('../../utils/apiError');
const BaseService = require('../base/BaseService');
const UserModel = require('./user.model');

class UserService extends BaseService {
    constructor() {
        super(UserModel); // Pass the User model to the BaseService
    }

    async findUserById(id) {
        return await this.model.findById(id).populate('profilePhoto', '_id url'); // Populate organization details
    }
    // Example of a custom service method: Find users by role
    async findUsersByRole(role) {
        return await this.model.model.find({ role }).populate('org', 'name'); // Populate organization details
    }

   


}

module.exports = new UserService();
