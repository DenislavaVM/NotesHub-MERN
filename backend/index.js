require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const { check, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./utils");
const logger = require("./logger");

const authController = require("./controllers/auth.controller");
const userController = require("./controllers/user.controller");
const noteController = require("./controllers/note.controller");

const saltRounds = 10;
const app = express();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

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
            message: options.message,
        });
    },
});
app.use("/login", loginLimiter);

app.get("/", (req, res) => {
    res.json({ data: "Hello" });
});

app.post("/create-account", [
    check("firstName").not().isEmpty().withMessage("First name is required"),
    check("lastName").not().isEmpty().withMessage("Last name is required"),
    check("email").isEmail().withMessage("Valid email is required"),
    check("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
], authController.createAccount);

app.post("/login", [
    check("email").isEmail().withMessage("Valid email is required"),
    check("password").not().isEmpty().withMessage("Password is required"),
], authController.login);

app.get("/get-user", authenticateToken, userController.getUser);

app.post("/add-note", authenticateToken, noteController.addNote);

app.put("/edit-note/:noteId", authenticateToken, noteController.editNote);

app.get("/get-all-notes", authenticateToken, noteController.getAllNotes);

app.delete("/delete-note/:noteId", authenticateToken, noteController.deleteNote);

app.put("/update-note-pinned/:noteId", authenticateToken, noteController.updateNotePinned);

app.get("/search-notes", authenticateToken, noteController.getAllNotes);

app.put("/archive-note/:noteId", authenticateToken, noteController.archiveNote);

app.put("/complete-note/:noteId", authenticateToken, noteController.completeNote);

app.put("/add-label/:noteId", authenticateToken, noteController.addLabel);

app.put("/remove-label/:noteId", authenticateToken, noteController.removeLabel);

app.put("/set-reminder/:noteId", authenticateToken, noteController.setReminder);

app.use((err, req, res, next) => {
    logger.error(`Error: ${err.message}`);
    res.status(err.status || 500).json({
        error: true,
        message: err.message || "Internal Server Error",
    });
});

app.listen(3000, () => logger.info("Server started on port 3000"));

module.exports = app;
