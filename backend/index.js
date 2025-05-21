require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const logger = require("./logger");

const routes = require("./routes");

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 3000;

const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/notes-app";

mongoose.connect(mongoURI);

app.use(cookieParser());
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(helmet());

router.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to NotesHub API",
        status: "OK",
        version: "1.0.0",
    });
});

app.use("/", routes);

app.use((err, req, res, next) => {
    logger.error(`Error: ${err.message}`);
    res.status(err.status || 500).json({
        error: true,
        message: err.message || "Internal Server Error",
    });
});

app.listen(PORT, () => logger.info(`Server started on port ${PORT}`));