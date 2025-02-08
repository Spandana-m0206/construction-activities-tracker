const { StatusCodes } = require('http-status-codes');
const { default: ApiError } = require('../../utils/apiError');
const BaseService = require('../base/BaseService');
const UserModel = require('./user.model');
const generatePasswordForNewUser=require('../../utils/generateSendPasswordEmail')
const sendEmail=require('../../utils/sentgrid')

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
    async sendPasswordForNewUser(user,password){
        try {
            const template=generatePasswordForNewUser(user?.name,password)
            return await sendEmail(user.email,"Password For User",template)
            
        } catch (error) {
            throw new Error("Failed to send OTP: " + error?.message)
        }
    }
   


}

module.exports = new UserService();
