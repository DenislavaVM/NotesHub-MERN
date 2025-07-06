const rateLimit = require("express-rate-limit");
const logger = require("../logger");
const { isProduction } = require("./env");

const getClientInfo = (req) => {
    const emailInfo = req.body?.email ? `, email: ${req.body.email}` : "";
    return isProduction ? `IP: ${req.ip}` : `IP: ${req.ip}${emailInfo}`;
};

const createAuthLimiter = (actionType) => {
    return rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 5,
        message: `Too many ${actionType} attempts, please try again after 15 minutes.`,
        handler: (req, res, next, options) => {
            const clientInfo = getClientInfo(req);
            logger.warn(`Too many ${actionType} attempts from ${clientInfo}`);
            res.status(options.statusCode).json({
                error: true,
                message: options.message,
            });
        },
        skip: (req) => req.path === "/health",
    });
};

module.exports = {
    loginLimiter: createAuthLimiter("login"),
    registerLimiter: createAuthLimiter("registration"),
};