const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const noteSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: { type: [String], default: [] },
    isPinned: { type: Boolean, required: false },
    userId: { type: String, required: true },
    sharedWith: { type: [String], default: [] },
    createdOn: { type: Date, default: Date.now },
    isArchived: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
    updatedOn: { type: Date, default: Date.now },
    reminder: { type: Date, default: null },
});

module.exports = mongoose.model("Note", noteSchema);