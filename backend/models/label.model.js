const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const labelSchema = new Schema({
    name: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
     createdOn: { type: Date, default: Date.now },
    updatedOn: { type: Date, default: Date.now },
}, { timestamps: true });

labelSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Label", labelSchema);