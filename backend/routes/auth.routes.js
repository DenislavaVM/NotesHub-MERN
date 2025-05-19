const express = require("express");
const rateLimit = require("express-rate-limit");

const authController = require("../controllers/auth.controller");
const logger = require("../logger");
const { validateRegisterFields, validateLoginFields } = require("../middleware/validation");

const router = express.Router();

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

router.post("/create-account", registerLimiter, validateRegisterFields, authController.createAccount);
router.post("/login", loginLimiter, validateLoginFields, authController.login);

module.exports = router;