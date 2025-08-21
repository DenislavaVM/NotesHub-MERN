const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const noteSchema = new Schema({
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    tags: [{ type: Schema.Types.ObjectId, ref: "Label" }],
    isPinned: { type: Boolean, default: false },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sharedWith: [{ type: String, lowercase: true, trim: true }],
    isArchived: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
    reminder: { type: Date, default: null },
    createdOn: { type: Date, default: Date.now },
    updatedOn: { type: Date, default: Date.now },
}, { timestamps: true });

noteSchema.index({ userId: 1, isArchived: 1 });
noteSchema.index({ userId: 1, isPinned: -1 });
noteSchema.index({ sharedWith: 1 });

module.exports = mongoose.model("Note", noteSchema);