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

exports.forgotPassword = async (req, res, next) =>{
  try {
    const {email} = req.body;
    const user = await UserService.forgotPassword(email);
    //we have reset password token in user
    //TODO: send email
    return res.status(StatusCodes.ACCEPTED)
     .json(new ApiResponse(StatusCodes.ACCEPTED, {}, `Reset Password Mail send to ${email?.toLowerCase()}`));
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message, error))
  }
}

exports.resetPassword = async (req, res, next) => {
  try {
    const {email, password, resetPasswordToken} = req.body;
    if(!email ||!password ||!resetPasswordToken){
      return res.status(400).json(new ApiError(StatusCodes.BAD_REQUEST, "Please fill required fields"));
    }
    const user = await UserService.resetPassword(email?.trim().toLowerCase(), password, resetPasswordToken);
    if(!user){
      return res.status(StatusCodes.UNAUTHORIZED).json(new ApiError(StatusCodes.UNAUTHORIZED, "Invalid token or email"));
    }
    const token = await AuthService.generateToken(user);
    return res.status(StatusCodes.ACCEPTED)
      .json(new ApiResponse(StatusCodes.ACCEPTED, {token}, "Password reset successfully"))

  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message, error))    
  }
}