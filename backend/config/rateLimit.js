const rateLimit = require("express-rate-limit");
const logger = require("../logger");

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many login attempts, please try again after 15 minutes",
    handler: (req, res, next, options) => {
        logger.warn(`Too many login attempts for IP: ${req.ip}, email: ${req.body.email}`);
        res.status(options.statusCode).json({ error: true, message: options.message });
    },
});

const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many registration attempts, please try again after 15 minutes",
    handler: (req, res, next, options) => {
        logger.warn(`Too many signup attempts from IP: ${req.ip}`);
        res.status(options.statusCode).json({ error: true, message: options.message });
    },
});

module.exports = {
    loginLimiter,
    registerLimiter,
};