const { AppError, ValidationError, AuthenticationError, RateLimitError, ServiceUnavailableError, NotFoundError } = require("../errors");
const { isProduction } = require("../config/env");
const logger = require("../logger");

module.exports = (err, req, res, next) => {
    logger.error(`${err.statusCode || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    if (!isProduction) {
        logger.error(err.stack);
    };

    let customError = err;

    if (customError.name === "JsonWebTokenError") {
        customError = new AuthenticationError("Invalid token");
    } else if (customError.name === "TokenExpiredError") {
        customError = new AuthenticationError("Token expired");
    } else if (customError.name === "ValidationError" && customError.errors) {
        const errors = Object.values(customError.errors).map(el => el.message);
        customError = new ValidationError("Validation failed", errors);
    } else if (customError.code === 11000) {
        const field = Object.keys(customError.keyValue)[0];
        customError = new ValidationError(`${field} already exists`);
    } else if (customError.name === "CastError") {
        customError = new NotFoundError("Resource", customError.value);
    } else if (customError.type === "entity.too.large") {
        customError = new ValidationError("Request payload too large");
    } else if (["ECONNRESET", "ETIMEDOUT", "MongooseServerSelectionError"].includes(customError.code)) {
        customError = new ServiceUnavailableError();
    } else if (!customError.isOperational) {
        logger.error("CRITICAL Non-Operational Error: " + customError.message);
        customError = new AppError("Internal Server Error", 500, "INTERNAL_ERROR");
    };

    res.status(customError.statusCode || 500).json({
        error: {
            code: customError.errorCode,
            message: customError.message,
            ...(!isProduction && { stack: customError.stack }),
            ...(customError.errors && customError.errors.length > 0 && { details: customError.errors }),
        },
    });
};