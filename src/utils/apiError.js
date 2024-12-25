class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something Went Wrong",
        error = null,
        stack='',
        ){
        super(message)
        this.message = message
        this.error = error
        if (stack) {
            this.stack = stack
        }


    }

    toJSON() {
        return {
          success: false,
          statusCode: this.statusCode,
          message: this.message,
          error: this.error,
        };
    }
}
module.exports = ApiError;