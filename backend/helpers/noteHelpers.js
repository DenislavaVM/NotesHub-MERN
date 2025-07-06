const Note = require("../models/note.model.js");

exports.getNoteByIdWithUser = async (noteId) => {
    return await Note.findById(noteId)
        .populate("userId", "firstName lastName email")
        .populate("labels", "name");
};