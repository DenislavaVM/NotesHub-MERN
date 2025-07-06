require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

const env = {
    isProduction,
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: process.env.PORT || 3000,
    MONGO_URI: process.env.MONGO_URI,
    FRONTEND_URL: process.env.FRONTEND_URL,
    BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,
};

const requiredEnvVars = [
    "MONGO_URI",
];

if (isProduction) {
    requiredEnvVars.push("FRONTEND_URL");
};

for (const v of requiredEnvVars) {
    if (!env[v]) {
        console.error(`FATAL ERROR: Environment variable ${v} is not defined.`);
        process.exit(1);
    };
};

module.exports = env;