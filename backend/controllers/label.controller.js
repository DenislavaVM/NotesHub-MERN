const Label = require("../models/label.model");
const logger = require("../logger");
const Note = require("../models/note.model");
const {
    ValidationError,
    NotFoundError,
    DatabaseError
} = require("../errors");

const broadcastLabelUpdate = (req) => {
    const userId = req.user._id;
    if (req.io) {
        req.io.to(`user_${userId}`).emit("labels:updated");
    }
};

exports.getAllLabels = async (req, res, next) => {
    const userId = req.user._id;
    try {
        const labels = await Label.find({ userId }).sort({ name: 1 });
        res.json({ success: true, data: labels });
    } catch (error) {
        next(new DatabaseError("Failed to fetch labels"));
    };
};

exports.createLabel = async (req, res, next) => {
    const userId = req.user._id;
    const { name } = req.body;

    try {
        const existing = await Label.findOne({ name, userId });
        if (existing) {
            throw new ValidationError("Label already exists");
        };

        const label = new Label({ name, userId });
        await label.save();
        broadcastLabelUpdate(req);
        res.status(201).json({
            success: true,
            data: label,
            message: "Label created successfully"
        });
    } catch (error) {
        next(error);
    };
};

exports.updateLabel = async (req, res, next) => {
    const userId = req.user._id;
    const labelId = req.params.labelId;
    const { name } = req.body;

    try {
        const label = await Label.findOne({ _id: labelId, userId });
        if (!label) {
            throw new NotFoundError("Label", labelId);
        };

        label.name = name;
        await label.save();
        broadcastLabelUpdate(req);

        res.json({
            success: true,
            data: label,
            message: "Label updated successfully"
        });
    } catch (error) {
        next(error);
    };
};

exports.deleteLabel = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const labelId = req.params.labelId;
        const label = await Label.findOne({ _id: labelId, userId });
        if (!label) {
            throw new NotFoundError("Label", labelId);
        };

        await Label.deleteOne({ _id: labelId, userId });
        await Note.updateMany(
            { userId, labels: labelId },
            { $pull: { labels: labelId } }
        );
        broadcastLabelUpdate(req);
        res.json({
            success: true,
            message: "Label deleted successfully"
        });
    } catch (error) {
        next(error);
    };
};