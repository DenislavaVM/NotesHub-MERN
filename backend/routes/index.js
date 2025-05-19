const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const noteRoutes = require("./note.routes");
const labelRoutes = require("./label.routes");

router.use("/", authRoutes);
router.use("/", userRoutes);
router.use("/", noteRoutes);
router.use("/", labelRoutes);

module.exports = router;