const express = require("express");
const { check, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");

const authController = require("../controllers/auth.controller");
const logger = require("../logger");

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

router.post("/create-account", registerLimiter, [
    check("firstName").notEmpty().withMessage("First name is required"),
    check("lastName").notEmpty().withMessage("Last name is required"),
    check("email").isEmail().withMessage("Valid email is required"),
    check("password")
        .matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/)
        .withMessage("Password must be at least 8 characters, include one uppercase letter and one number"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ error: true, message: errors.array()[0].msg });
        next();
    },
], authController.createAccount);

router.post("/login", loginLimiter, [
    check("email").isEmail().withMessage("Valid email is required"),
    check("password").notEmpty().withMessage("Password is required"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ error: true, message: errors.array()[0].msg });
        next();
    },
], authController.login);

module.exports = router;