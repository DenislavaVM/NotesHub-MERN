const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const labelSchema = new Schema({
    name: { type: String, required: true },
    userId: { type: String, required: true },
    createdOn: { type: Date, default: Date.now },
    updatedOn: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Label", labelSchema);