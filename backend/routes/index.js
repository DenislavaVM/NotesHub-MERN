const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes.js");
const userRoutes = require("./user.routes.js");
const noteRoutes = require("./note.routes.js");
const labelRoutes = require("./label.routes.js");
const notificationRoutes = require("./notification.routes.js");

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/notes", noteRoutes);
router.use("/labels", labelRoutes);
router.use("/notifications", notificationRoutes);

module.exports = router;