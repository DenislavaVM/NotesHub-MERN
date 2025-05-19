const express = require("express");
const noteController = require("../controllers/note.controller");
const { authenticateToken } = require("../utils");

const router = express.Router();

router.post("/add-note", authenticateToken, noteController.addNote);
router.put("/edit-note/:noteId", authenticateToken, noteController.editNote);
router.get("/get-all-notes", authenticateToken, noteController.getAllNotes);
router.get("/search-notes", authenticateToken, noteController.getAllNotes);
router.delete("/delete-note/:noteId", authenticateToken, noteController.deleteNote);
router.put("/update-note-pinned/:noteId", authenticateToken, noteController.updateNotePinned);
router.put("/archive-note/:noteId", authenticateToken, noteController.archiveNote);
router.put("/complete-note/:noteId", authenticateToken, noteController.completeNote);
router.put("/add-label/:noteId", authenticateToken, noteController.addLabel);
router.put("/remove-label/:noteId", authenticateToken, noteController.removeLabel);
router.put("/set-reminder/:noteId", authenticateToken, noteController.setReminder);
router.put("/share-note/:noteId", authenticateToken, noteController.shareNote);

module.exports = router;