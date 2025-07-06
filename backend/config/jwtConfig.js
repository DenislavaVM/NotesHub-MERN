require("dotenv").config();
const { ACCESS_TOKEN_SECRET, JWT_REFRESH_SECRET } = process.env;

if (!ACCESS_TOKEN_SECRET || !JWT_REFRESH_SECRET) {
    console.error("FATAL ERROR: JWT secret environment variables are not defined.");
    process.exit(1);
};

module.exports = {
    ACCESS_TOKEN_SECRET: ACCESS_TOKEN_SECRET,
    JWT_REFRESH_SECRET: JWT_REFRESH_SECRET,
    TOKEN_EXPIRATION: "1h",
    REFRESH_TOKEN_EXPIRATION: "7d",
};