const { StatusCodes } = require('http-status-codes');
const { default: ApiError } = require('../../utils/apiError');
const BaseService = require('../base/BaseService');
const UserModel = require('./user.model');

class UserService extends BaseService {
    constructor() {
        super(UserModel); // Pass the User model to the BaseService
    }
    async find(filter={}) {
       const data = this.model.find(filter)
       .populate('profilePhoto','_id url') // Populate organization details
       return data;
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
