const express = require("express");
const labelController = require("../controllers/label.controller");
const { authenticateToken } = require("../utils");
const { validateLabel } = require("../middleware/validation");

const router = express.Router();

router.get("/", authenticateToken, labelController.getAllLabels);
router.post("/", authenticateToken, validateLabel, labelController.createLabel);
router.put("/:labelId", authenticateToken, validateLabel, labelController.updateLabel);
router.delete("/:labelId", authenticateToken, labelController.deleteLabel);

module.exports = router;