const OrgService = require("../org/org.service");
// const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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

