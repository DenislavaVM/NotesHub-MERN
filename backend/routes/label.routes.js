const express = require("express");
const labelController = require("../controllers/label.controller");
const { authenticateToken } = require("../utils");

const router = express.Router();

router.get("/labels", authenticateToken, labelController.getAllLabels);
router.post("/labels", authenticateToken, labelController.createLabel);
router.put("/labels/:labelId", authenticateToken, labelController.updateLabel);
router.delete("/labels/:labelId", authenticateToken, labelController.deleteLabel);

module.exports = router;