const express = require("express");
const authRoutes = require("./auth");
const userRoutes = require("../modules/users/user.routes");

const router = express.Router();

router.use("/v1/auth", authRoutes);
router.use('/v1/users', userRoutes);

// Error Handling Middleware
// app.use(errorHandler);
module.exports = router;
