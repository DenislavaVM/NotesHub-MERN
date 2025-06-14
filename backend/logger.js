const isProduction = process.env.NODE_ENV === "production";
const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf } = format;

const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
  });

const logger = createLogger({
  level: isProduction ? "warn" : "info",
  format: combine(
    timestamp(),
    logFormat
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "error.log", level: "error" }),
    new transports.File({ filename: "combined.log" })
  ]
});

module.exports = logger;