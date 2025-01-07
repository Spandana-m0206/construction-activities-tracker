const OrgService = require("../org/org.service");
const jwt = require("jsonwebtoken");
const generateOTPEmailForResetPassword = require('../../utils/generateSendOtpEmail')
const sendEmail = require('../../utils/sentgrid');
const UserService = require("../user/user.service");
const ApiError  = require("../../utils/apiError");
const { StatusCodes } = require("http-status-codes");

exports.generateToken = async (user) => {
    try {
            const org = await OrgService.findById(user.org);
            const token = jwt.sign(
                {
                    userId: user._id,
                    name: user.name,
                    role: user.role,
                    orgId: org._id,
                    orgName: org.name,
                    email: user.email
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "12h"
                }
            )
            return token
    } catch (error) {
        throw new Error("Failed to generate token: " + error?.message)
    }
};
exports.resetPassword= async (email, newPassword, resetToken)=> {
    const user=await UserService.findOne({email:email.toLowerCase().trim()})
    if(!user){
        throw new Error('Invalid token or email');
    }
  if(!user.verifyPasswordResetToken(resetToken)){
    throw new ApiError(StatusCodes.BAD_REQUEST,"Invalid Token","Invalid Token")
  }
    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    user.resetOTP = undefined;
    user.resetOTPExpiry = undefined;
    await user.save();
    return user;

}
exports.resetPassword= async (email, newPassword, resetToken)=> {
    const user=await UserService.findOne({email:email.toLowerCase().trim()})
    if(!user){
        throw new Error('Invalid token or email');
    }
  if(!user.verifyPasswordResetToken(resetToken)){
    throw new ApiError(StatusCodes.BAD_REQUEST,"Invalid Token","Invalid Token")
  }
    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    user.resetOTP = undefined;
    user.resetOTPExpiry = undefined;
    await user.save();
    return user;

}
exports.sendOTPForResetPassword = async (user) => {
    try {
        const template = generateOTPEmailForResetPassword(user?.name, user.resetOTP);
        return await sendEmail(user.email, "Password Reset Request", template);
        
        return await sendEmail(user.email, "Password Reset Request", template);
        
    } catch (error) {
        throw new Error("Failed to send OTP: " + error?.message)
    }
} 
exports.forgetPassword= async (email)=> {
    const user = await UserService.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
        throw new ApiError
        (StatusCodes.NOT_FOUND,'User not found',"User Not Found");
    }
   user.generatePasswordResetOTP()
    await user.save();
    return user;
}

exports.forgetPassword= async (email)=> {
    const user = await UserService.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
        throw new ApiError
        (StatusCodes.NOT_FOUND,'User not found',"User Not Found");
    }
   user.generatePasswordResetOTP()
    await user.save();
    return user;
}
exports.generateRefreshToken=async (userId,orgId)=>{
    const token =await jwt.sign({
        userId,
        orgId
    },process.env.REFRESH_SECRET,{
        expiresIn:"7d"
    })
    
   return token  
    
}
exports.saveRefreshToken=async (userId,token)=>{
    const user= await UserService.findById(userId);
    user.refreshToken=token;
    await user.save();
}
exports.getPayLoadFromToken=async (refreshToken)=>{
  const payLoad= await jwt.verify(refreshToken,process.env.REFRESH_SECRET)
  if(!payLoad){
    return false;
  }
  return payLoad;

}

