const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const noteSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: [{ type: Schema.Types.ObjectId, ref: "Label" }],
    isPinned: { type: Boolean, required: false },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sharedWith: [{ type: String }],
    createdOn: { type: Date, default: Date.now },
    isArchived: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
    updatedOn: { type: Date, default: Date.now },
    reminder: { type: Date, default: null },
});

module.exports = mongoose.model("Note", noteSchema);