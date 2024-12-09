// const User = require("../users/user.model");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");

// exports.register = async ({ email, password, name }) => {
//   const hashedPassword = await bcrypt.hash(password, 10);
//   return User.create({ email, password: hashedPassword, name });
// };

// exports.login = async ({ email, password }) => {
//   const user = await User.findOne({ email });
//   if (!user || !(await user.comparePassword(password))) {
//     throw new Error("Invalid credentials");
//   }
//   return jwt.sign(
//     { userId: user._id, role: user.role },
//     process.env.JWT_SECRET,
//     { expiresIn: "1h" },
//   );
// };
