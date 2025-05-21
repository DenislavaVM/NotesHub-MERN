require("dotenv").config();

module.exports = {
    JWT_SECRET: process.env.ACCESS_TOKEN_SECRET || "default_secret",
    TOKEN_EXPIRATION: "1h",
};