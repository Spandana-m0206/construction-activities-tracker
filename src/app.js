require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const compression = require("compression");
const routes = require("./modules");
const { connectDB } = require("./config/database");

const app = express();

// Security Middlewares
app.use(helmet());
app.use(compression());

// Body Parser
app.use(express.json());

// Routes
app.use("/api", routes);

// Error Handling Middleware
app.use(require("./middlewares/error.middleware"));

// Connect to Database
connectDB();

module.exports = app;
