const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const logger = require('../utils/logger');

let gfsBucket;

// MongoDB connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            maxPoolSize: 10,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        if (conn.connection.readyState === 1) {
            logger.info('MongoDB connection is open');

            // Initialize GridFSBucket
            const db = mongoose.connection.db;
            gfsBucket = new GridFSBucket(db, {
                bucketName: 'uploads',
            });
            logger.info('MongoDB Connected with GridFSBucket');
        } else {
            throw new Error('MongoDB connection is not open');
        }
    } catch (err) {
        logger.error(`MongoDB connection error: ${err.message}`);
        process.exit(1);
    }
};

// Retrieve GridFSBucket instance
const getGFSBucket = () => {
    if (!gfsBucket) {
        throw new Error('GridFSBucket is not initialized');
    }
    return gfsBucket;
};

module.exports = { connectDB, getGFSBucket };
