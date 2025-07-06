class AppError extends Error {
    constructor(message, statusCode, errorCode) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    };
};

class ValidationError extends AppError {
    constructor(message, errors) {
        super(message || "Validation failed", 400, "VALIDATION_ERROR");
        this.errors = errors || [];
    };
};

class NotFoundError extends AppError {
    constructor(resource, id) {
        super(`${resource || "Resource"}${id ? ` with ID ${id}` : ""} not found`, 404, "NOT_FOUND");
    };
};

class AuthenticationError extends AppError {
    constructor(message) {
        super(message || "Authentication failed", 401, "AUTHENTICATION_ERROR");
    };
};

class AuthorizationError extends AppError {
    constructor(message) {
        super(message || "Not authorized", 403, "AUTHORIZATION_ERROR");
    };
};

class DatabaseError extends AppError {
    constructor(message) {
        super(message || "Database operation failed", 500, "DATABASE_ERROR");
    };
};

class RateLimitError extends AppError {
    constructor(message) {
        super(message || "Too many requests", 429, "RATE_LIMIT_EXCEEDED");
    };
};

class ServiceUnavailableError extends AppError {
    constructor(message) {
        super(message || "Service temporarily unavailable", 503, "SERVICE_UNAVAILABLE");
    };
};

module.exports = {
    AppError,
    ValidationError,
    NotFoundError,
    AuthenticationError,
    AuthorizationError,
    DatabaseError,
    RateLimitError,
    ServiceUnavailableError
};