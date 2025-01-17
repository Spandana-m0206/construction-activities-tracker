const BaseController = require('../base/BaseController');
const UserService = require('./user.service');
const ApiResponse = require('../../utils/apiResponse');
const { StatusCodes } = require('http-status-codes');
const enumToArray  = require('../../utils/EnumToArray');
const { Roles } = require('../../utils/enums');
const ApiError = require('../../utils/apiError');
const userService = require('./user.service');
const {generateRandomPassword} = require('../../utils/password');
const fileService = require('../file/file.service');
class UserController extends BaseController {
    constructor() {
        super(UserService); // Pass the UserService to the BaseController
    }
    async findOne(req, res, next) {
        try {
            const user = await this.service.findUserById(req.params.id);
            if (!user) {
                return res.status(StatusCodes.NOT_FOUND).json(new ApiError(StatusCodes.NOT_FOUND, "User not found"));
            }
            res.status(StatusCodes.ACCEPTED).json(new ApiResponse(StatusCodes.ACCEPTED, user, "User fetched successfully"));
        } catch (error) {
            next(error);
        }
    }
    async uploadProfilePhoto(req, res, next) {
        try {
            const user = req.user;
            if(req.file){
                const attachment = await fileService.create({
                    filename: req.file.originalname,
                    type: req.file.mimetype,
                    size: req.file.size,
                    org: req.user.org,
                    uploadedBy: req.user.userId, // Assuming userId is in the request user object
                    url: `${process.env.BASE_URL}/api/v1/files/link/${req.file.id}`, // Example URL format
                })
                user.profilePhoto = attachment._id
            }
            await user.save();
            res.status(StatusCodes.ACCEPTED).json(new ApiResponse(StatusCodes.ACCEPTED, user, "Profile photo uploaded successfully"));
        } catch (error) {
            next(error);
        }
    }
    // Example of a custom controller method: Get users by role
    async getUsersByRole(req, res, next) {
        try {
            const users = await this.service.findUsersByRole(req.params.role);
            res.status(StatusCodes.ACCEPTED).json(new ApiResponse(StatusCodes.ACCEPTED, users, "User fetched successfully"));
        } catch (error) {
            next(error);
        }
    }

    async create (req, res) {
        try {
            const {name, countryCode, phone, email, language, role } = req.body;
    
            if(!role || !role.trim() || !enumToArray(Roles).includes(role) ){
                console.log(enumToArray(Roles))
                return res.status(StatusCodes.BAD_REQUEST)
                    .json( new ApiError(StatusCodes.BAD_REQUEST, "Please provide a valid role" ))
            }
            if(!name ||!countryCode ||!phone ||!email ||!language){
                return res.status(StatusCodes.BAD_REQUEST).json(new ApiError(StatusCodes.BAD_REQUEST, "Please fill required fields"));
            }
            const isUserExisted = await UserService.findOne({
                $or: [
                  { email },
                  { phone }
                ]
              })
            if(isUserExisted){
                return res.status(StatusCodes.BAD_REQUEST).json(new ApiError(StatusCodes.BAD_REQUEST, "User with same Email or Phone already exists"));
            }      
            if(!req.user.org){
                return res.status(StatusCodes.FORBIDDEN).json(new ApiError(StatusCodes.FORBIDDEN, "You are not authorized to create a user in this organization" ))
            }
            const password = generateRandomPassword()
            const newUser = await UserService.create({name, countryCode, email:email.trim().toLowerCase(),role, phone, language, password,org:req.user.org})
            //TODO: send a create user email 
            delete newUser.password
            return res.status(StatusCodes.CREATED)
                .json( new ApiResponse(StatusCodes.CREATED, {
                    userId:newUser._id,
                    name:newUser.name,
                    email:newUser.email,
                    role:newUser.role,
                    phone:newUser.phone,
        },"User created successfully"))
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message, error))
    }
}   

}

module.exports = new UserController();
