const OrgService = require("../org/org.service");
// const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const generateOTPEmailForResetPassword = require('../../utils/generateSendOtpEmail')
const sendEmail = require('../../utils/sentgrid')
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

exports.sendOTPForResetPassword = async (user) => {
    try {
        const template = generateOTPEmailForResetPassword(user?.name, user.resetOTP);
        await sendEmail(user.email, "Password Reset Request", template);
    } catch (error) {
        throw new Error("Failed to send OTP: " + error?.message)
    }
} 
