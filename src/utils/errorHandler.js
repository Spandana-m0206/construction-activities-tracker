function errorHandler(err, req, res, next) {
    console.error(err.stack); // Log error details for debugging

    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode);

    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack, // Hide stack in production
        status: 'error',
    });
}

module.exports = errorHandler;
