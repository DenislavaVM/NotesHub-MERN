const express = require("express");
const noteController = require("../controllers/note.controller");
const { authenticateToken } = require("../utils");
const {
    validateNoteFields,
    validateIsPinned,
    validateIsArchived,
    validateIsCompleted,
    validateEditNoteFields,
    validateNoteLabelField,
    validateReminderField,
    validateShareNoteFields
} = require("../middleware/validation");

const router = express.Router();

router.post("/add-note", authenticateToken, validateNoteFields, noteController.addNote);
router.put("/edit-note/:noteId", authenticateToken, validateEditNoteFields, noteController.editNote);
router.get("/get-all-notes", authenticateToken, noteController.getAllNotes);
router.delete("/delete-note/:noteId", authenticateToken, noteController.deleteNote);
router.put("/update-note-pinned/:noteId", authenticateToken, validateIsPinned, noteController.updateNotePinned);
router.put("/archive-note/:noteId", authenticateToken, validateIsArchived, noteController.archiveNote);
router.put("/complete-note/:noteId", authenticateToken, validateIsCompleted, noteController.completeNote);
router.put("/add-label/:noteId", authenticateToken, validateNoteLabelField, noteController.addLabel);
router.put("/remove-label/:noteId", authenticateToken, validateNoteLabelField, noteController.removeLabel);
router.put("/set-reminder/:noteId", authenticateToken, validateReminderField, noteController.setReminder);
router.put("/share-note/:noteId", authenticateToken, validateShareNoteFields, noteController.shareNote);

module.exports = router;