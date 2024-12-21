const jwt = require("jsonwebtoken");
const { default: ApiError } = require("../utils/apiError");

exports.authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json(new ApiError(401, "Access denied"));

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json(new ApiError(401, "Access denied"));

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if(!verified) return res.status(401).json(new ApiError(401, "Access Denied, Invalid token"));
    //TODO: get user from user modal and add req.user = user
    req.user = verified;
    req.user.userId = verified._id.toString();
    next();
  } catch (err) {
    res.status(403).send("Invalid Token");
  }
};