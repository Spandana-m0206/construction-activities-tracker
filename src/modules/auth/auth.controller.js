const { StatusCodes } = require("http-status-codes");
const { default: ApiError } = require("../../utils/apiError");
const AuthService = require("./auth.service");
const UserService = require("../user/user.service");
const { default: ApiResponse } = require("../../utils/apiResponse");

exports.login = async (req, res, next) => {
  try {
        const {email, password } = req.body;
        if(!email ||!password){
            return res.status(400).json(new ApiError(StatusCodes.BAD_REQUEST, "Please fill required fields"));
        }
        const user = await UserService.findOne({email:email.trim().toLowerCase()});
        if(!user || !await user.isPasswordCorrect(password)){
            return res.status(401).json(new ApiError(StatusCodes.UNAUTHORIZED, "Invalid Credentials"));
        }
        const token = await AuthService.generateToken(user);
        delete user.password
        return res.status(StatusCodes.OK)
           .json(new ApiResponse(StatusCodes.OK, {token, user}, "User logged in successfully"));
  } catch (err) {
    next(err);
  }
};
