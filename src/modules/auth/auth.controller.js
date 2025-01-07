const { StatusCodes } = require("http-status-codes");
const  ApiError  = require("../../utils/apiError");
const AuthService = require("./auth.service");
const UserService = require("../user/user.service");
const ApiResponse  = require("../../utils/apiResponse");


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
        const refreshToken =await AuthService.generateRefreshToken(user._id,user.org)
        await AuthService.saveRefreshToken(user._id,refreshToken)
        delete user.password
        return res.status(StatusCodes.OK)
           .json(new ApiResponse(StatusCodes.OK, {token,refreshToken,user}, "User logged in successfully"));
  } catch (err) {
    next(err);
  }
};
exports.refreshAccessToken=async (req,res)=>{
  try {
    const {refreshToken}=req.body
    
    if(!refreshToken){
      return res.status(401).json(new ApiError(StatusCodes.UNAUTHORIZED,"Token Not Found","Token Not Found"))
    }
    const {userId}=await AuthService.getPayLoadFromToken(refreshToken)
    const user=await UserService.findById(userId)
    if(user.refreshToken!=refreshToken){
      return res.status(StatusCodes.UNAUTHORIZED).json(new ApiError(StatusCodes.UNAUTHORIZED,"Invalid Token","Invalid Token"))
    }
    const newAccessToken=await AuthService.generateToken(user)
    const newRefreshToken=await AuthService.generateRefreshToken(userId,user.org)
    await AuthService.saveRefreshToken(userId,newRefreshToken)
    return res.status(StatusCodes.ACCEPTED).json(new ApiResponse(StatusCodes.ACCEPTED,{accessToken:newAccessToken,refreshToken:newRefreshToken},"Successfuly Token Generated")
    )

} catch (error) {
  
    
  }

}

exports.forgotPassword = async (req, res, next) =>{
  try {
    const {email} = req.body;
    const user = await AuthService.forgetPassword(email);
    
    await AuthService.sendOTPForResetPassword(user)
    
    return res.status(StatusCodes.ACCEPTED)
     .json(new ApiResponse(StatusCodes.ACCEPTED, {}, `Reset Password Mail send to ${email?.toLowerCase()}`));
  } catch (error) {
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR )
    .json(new ApiError(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR, error.message, error))    
  }
}

exports.resetPassword = async (req, res, next) => {
  try {
    const {email, password, resetPasswordToken} = req.body;
    if(!email ||!password ||!resetPasswordToken){
      return res.status(400).json(new ApiError(StatusCodes.BAD_REQUEST, "Please fill required fields"));
    }
    const user = await AuthService.resetPassword(email?.trim().toLowerCase(), password, resetPasswordToken);
    if(!user){
      return res.status(StatusCodes.UNAUTHORIZED).json(new ApiError(StatusCodes.UNAUTHORIZED, "Invalid token or email"));
    }
  
    return res.status(StatusCodes.ACCEPTED)
      .json(new ApiResponse(StatusCodes.ACCEPTED,{}, "Password reset successfully"))

  } catch (error) {
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR )
      .json(new ApiError(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR, error.message, error))    
  }
}
exports.verifyOTP=async (req,res)=>{
  try {
    const {email,otp}=req.body
    if(!otp){
      return res.status(StatusCodes.BAD_REQUEST).json(new ApiError(StatusCodes.BAD_REQUEST,"Enter OTP","OTP Is Required"))
    }
    if(!email){
      return res.status(StatusCodes.BAD_REQUEST).json(new ApiError(StatusCodes.BAD_REQUEST,"Enter Email","Email Is Required"))
    }
    const user=await UserService.findOne({email:email.toLowerCase().trim()})
    if(!user){
      return res.status(StatusCodes.NOT_FOUND).json(new ApiError(StatusCodes.NOT_FOUND,"User Not Found","User Not Found"))

    }
    if(!user.verifyPasswordResetOTP(otp)){
      return res.status(StatusCodes.BAD_REQUEST).json(new ApiError(StatusCodes.BAD_REQUEST,"Wrong OTP","Wrong OTP"))
    }
    user.generatePasswordResetToken();
    user.resetOTP=undefined
    user.resetOTPExpiry=undefined
   await user.save();
   res.status(StatusCodes.ACCEPTED).json(new ApiResponse(StatusCodes.ACCEPTED,{token:user.resetToken}))
    
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR,"Something Went Wrong",error))
    
  }
}
