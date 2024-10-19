// src/index.js
const cluster = require("cluster");
const os = require("os");
const app = require("./app");
const logger = require("./utils/logger");
const listEndpoints = require("express-list-endpoints");

const PORT = process.env.PORT || 3000;

if (cluster.isMaster) {
  const numCPUs = process.env.WORKER_COUNT ?? os.cpus().length;
  logger.info(`Master cluster setting up ${numCPUs} workers`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("online", (worker) => {
    logger.info(`Worker ${worker.process.pid} is online`);
  });

  cluster.on("exit", (worker, code, signal) => {
    logger.warn(`Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`);
    logger.info("Starting a new worker");
    cluster.fork();
  });
} else {
  // Log all registered routes using express-list-endpoints
  const endpoints = listEndpoints(app);
  logger.info("Registered Routes:");
  endpoints.forEach((endpoint) => {
    endpoint.methods.forEach((method) => {
      logger.info(`${method} ${endpoint.path}`);
    });
  });

  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT} and worker ${process.pid}`);
  });
}