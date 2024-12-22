const jwt = require("jsonwebtoken");
const { default: ApiError } = require("../utils/apiError");
const UserService = require("../modules/user/user.service");
const { StatusCodes } = require("http-status-codes");

exports.authMiddleware = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json(new ApiError(401, "Access denied"));

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json(new ApiError(401, "Access denied"));

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if(!verified) return res.status(401).json(new ApiError(401, "Access Denied, Invalid token"));
    //TODO: get user from user modal and add req.user = user
    const user = await UserService.findById(verified.userId);
    if(!user) return res.status(401).json(new ApiError(401, "Access Denied, User not found"));
    delete user.password;
    req.user = user;
    req.user.userId = user._id.toString();
    next();
  } catch (err) {
    res.status(403).json(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message));
  }
};