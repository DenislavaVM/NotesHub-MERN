require("dotenv").config();

const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI);

const User = require("./models/user.model");

const express = require("express");
const cors = require("cors");
const app = express();

const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./utils");

app.use(express.json());

app.use(
    cors({
        origin: "*",
    })
);

app.get("/", (req, res) => {
    res.json({ data: "Hello" });
});

app.post("/create-account", async (req, res) => {

    const { firstName, lastName, email, password } = req.body;

    if (!firstName) {
        return res
            .status(400)
            .json({ error: true, message: "First name is required" });
    }

    if (!lastName) {
        return res
            .status(400)
            .json({ error: true, message: "Last name is required" });
    }

    if (!email) {
        return res
            .status(400)
            .json({ error: true, message: "Email is required" });
    }

    if (!password) {
        return res
            .status(400)
            .json({ error: true, message: "Password is required" });
    }

    const isUser = await User.findOne({ email: email });

    if (isUser) {
        return res.json({
            error: true,
            message: "User already exists",
        });
    }

    const user = new User({
        firstName,
        lastName,
        email,
        password,
    });

    await user.save();

    const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "36000m",
    });

    return res.json({
        error: false,
        user,
        accessToken,
        message: "Registration successful",
    });
});

app.listen(3000, () => console.log("Server started on port 3000"));

module.exports = app;
