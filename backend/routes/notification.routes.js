const express = require("express");
const notificationController = require("../controllers/notification.controller");
const { authenticateToken } = require("../utils");

const router = express.Router();

router.get("/", authenticateToken, notificationController.getNotifications);
router.put("/:notificationId/read", authenticateToken, notificationController.markAsRead);

module.exports = router;