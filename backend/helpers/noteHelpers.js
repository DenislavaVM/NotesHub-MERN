const Note = require("../models/note.model");

exports.findUserNote = async (noteId, userId) => {
    return await Note.findOne({ _id: noteId, userId });
};

exports.findAndUpdateNote = async (noteId, userId, updateData) => {
    const note = await Note.findOne({ _id: noteId, userId });
    if (!note) {
        throw new Error("Note not found");
    };

    Object.assign(note, updateData);
    await note.save();
    return note;
};