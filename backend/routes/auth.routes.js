const express = require("express");
const { loginLimiter, registerLimiter } = require("../config/rateLimit");

const authController = require("../controllers/auth.controller");
const { validateRegisterFields, validateLoginFields } = require("../middleware/validation");

const router = express.Router();

router.post("/create-account", registerLimiter, validateRegisterFields, authController.createAccount);
router.post("/login", loginLimiter, validateLoginFields, authController.login);
router.get("/refresh", authController.handleRefreshToken);
router.post("/logout", authController.logout);

module.exports = router;