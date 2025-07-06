const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf } = format;
const { isProduction } = require("./config/env");

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
    new transports.Console({ handleExceptions: true }),
    new transports.File({ filename: "error.log", level: "error", maxsize: 10 * 1024 * 1024, maxFiles: 5 }),
    new transports.File({ filename: "combined.log", maxsize: 10 * 1024 * 1024, maxFiles: 5 })
  ],

  exceptionHandlers: [new transports.File({ filename: "exceptions.log" })],
  exitOnError: false,
});

module.exports = logger;