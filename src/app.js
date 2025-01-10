require("dotenv").config();
const logger = require("./utils/logger");
const express=require('express')
const {app,server}=require('./socket')
const helmet = require("helmet");
const compression = require("compression");
const routes = require("./modules");
const { connectDB } = require("./config/database");

 

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

const startServer = () => {
    connectDB().then(()=>{
        server.listen(process.env.PORT || 6010, ()=> {
            logger.info(`Server is running on port ${process.env.PORT} and worker ${process.pid}`);  
        })
    })
}


module.exports =startServer;
