const express = require("express");
const { authenticateToken } = require("../utils");
const userController = require("../controllers/user.controller");

const router = express.Router();

router.get("/get-user", authenticateToken, userController.getUser);

module.exports = router;