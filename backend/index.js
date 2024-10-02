require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const { check, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const logger = require("./logger");

mongoose.connect(process.env.MONGO_URI);

const User = require("./models/user.model");
const Note = require("./models/note.model");
const { authenticateToken } = require("./utils");
const bcrypt = require("bcrypt");

const app = express();

const jwt = require("jsonwebtoken");

const saltRounds = 10;

app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(helmet());

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many login attempts, please try again after 15 minutes",
    handler: (req, res, next, options) => {
        logger.warn(`Too many login attempts for IP: ${req.ip}, email: ${req.body.email}`);
        res.status(options.statusCode).json({
            error: true,
            message: options.message
        });
    }
});

app.use("/login", loginLimiter);

app.get("/", (req, res) => {
    res.json({ data: "Hello" });
});

app.post("/create-account", [
    check("firstName").not().isEmpty().withMessage("First name is required"),
    check("lastName").not().isEmpty().withMessage("Last name is required"),
    check("email").isEmail().withMessage("Valid email is required"),
    check("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long")
], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password } = req.body;

    try {
        const isUser = await User.findOne({ email: email });

        if (isUser) {
            return res.json({
                error: true,
                message: "User already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
        });

        await user.save();

        const accessToken = jwt.sign(
            { user: { _id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email } },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "1h" }
        );

        return res.json({
            error: false,
            user,
            accessToken,
            message: "Registration successful",
        });
    } catch (error) {
        logger.error(`Error during registration: ${error.message}`);
        next(error);
    }
});

app.post("/login", [
    check("email").isEmail().withMessage("Valid email is required"),
    check("password").not().isEmpty().withMessage("Password is required")
], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        const userInfo = await User.findOne({ email });

        if (!userInfo) {
            return res.status(400).json({ message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, userInfo.password);

        if (isPasswordValid) {
            const user = { _id: userInfo._id, firstName: userInfo.firstName, lastName: userInfo.lastName, email: userInfo.email };
            const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });

            logger.info(`User ${email} logged in successfully`);
            return res.json({ error: false, message: "Login successful", email, accessToken });
        } else {
            return res.status(400).json({ error: true, message: "Invalid credentials" });
        }
    } catch (error) {
        logger.error(`Error during login: ${error.message}`);
        next(error);
    }
});

app.get("/get-user", authenticateToken, async (req, res, next) => {
    try {
        const user = req.user;
        const isUser = await User.findOne({ _id: user._id });

        if (!isUser) {
            return res.sendStatus(401);
        }

        return res.json({
            user: {
                firstName: isUser.firstName,
                lastName: isUser.lastName,
                email: isUser.email,
                _id: isUser._id,
                createdOn: isUser.createdOn
            },
            message: "",
        });
    } catch (error) {
        logger.error(`Error retrieving user: ${error.message}`);
        next(error);
    }
});

app.post("/add-note", authenticateToken, async (req, res, next) => {
    const { title, content, tags, isPinned } = req.body;
    const user = req.user;

    if (!title) {
        const error = new Error("Title is required");
        error.status = 400;
        return next(error);
    }

    if (!content) {
        const error = new Error("Content is required");
        error.status = 400;
        return next(error);
    }

    try {
        const note = new Note({
            title,
            content,
            tags: tags || [],
            isPinned: isPinned || false,
            userId: user._id,
        });

        await note.save();

        logger.info(`Note added successfully by user: ${user.email}`);
        return res.json({
            error: false,
            note,
            message: "Note added successfully",
        });
    } catch (error) {
        logger.error(`Error adding note: ${error.message}`);
        next(error);
    }
});

app.use((err, req, res, next) => {
    logger.error(`Error: ${err.message}`);
    res.status(err.status || 500).json({
        error: true,
        message: err.message || "Internal Server Error",
    });
});

app.listen(3000, () => console.log("Server started on port 3000"));

module.exports = app;
