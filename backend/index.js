require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const compression = require("compression");

const { PORT, MONGO_URI, FRONTEND_URL, NODE_ENV } = require("./config/env");
const logger = require("./logger");
const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");
const isProduction = process.env.NODE_ENV === "production";

const app = express();
const server = http.createServer(app);

const corsOptions = {
    origin: isProduction ? FRONTEND_URL : "http://localhost:5173",
    credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.set("trust proxy", 1);
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

app.use((req, res, next) => {
    logger.info(`Request: ${req.method} ${req.originalUrl}`);
    logger.info(`Cookies Received: ${JSON.stringify(req.cookies)}`);
    next();
});

const io = new Server(server, { cors: corsOptions });
require("./socket")(io);
app.use((req, res, next) => {
    req.io = io;
    next();
});

const connectWithRetry = async () => {
    try {
        await mongoose.connect(MONGO_URI, { maxPoolSize: 10, retryWrites: true, w: "majority" });
        logger.info("MongoDB connected successfully");
    } catch (err) {
        logger.error(`MongoDB connection error: ${err.message}`);
        setTimeout(connectWithRetry, 5000);
    }
};

const startServer = async () => {
    try {
        await connectWithRetry();
        app.use("/api", routes);
        app.use(errorHandler);
        app.use((req, res) => {
            res.status(404).json({ error: true, message: `Cannot ${req.method} ${req.originalUrl}` });
        });

        server.listen(PORT, () => {
            logger.info(`Server started on port ${PORT} in ${NODE_ENV} mode`);
        });

    } catch (err) {
        logger.error("Failed to start server:", err);
        process.exit(1);
    }
};

startServer();