const Label = require("../models/label.model");
const logger = require("../logger");

exports.getAllLabels = async (req, res) => {
    const userId = req.user._id;
    try {
        const labels = await Label.find({ userId }).sort({ name: 1 });
        return res.json({ error: false, labels });
    } catch (error) {
        logger.error(`Error fetching labels: ${error.message}`);
        return res.status(500).json({ error: true, message: "Failed to fetch labels" });
    };
};

exports.createLabel = async (req, res) => {
    const userId = req.user._id;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: true, message: "Label name is required" });
    };

    try {
        const existing = await Label.findOne({ name, userId });
        if (existing) {
            return res.status(400).json({ error: true, message: "Label already exists" });
        };

        const label = new Label({ name, userId });
        await label.save();
        return res.json({ error: false, label, message: "Label created successfully" });
    } catch (error) {
        logger.error(`Error creating label: ${error.message}`);
        return res.status(500).json({ error: true, message: "Failed to create label" });
    };
};

exports.updateLabel = async (req, res) => {
    const userId = req.user._id;
    const labelId = req.params.labelId;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: true, message: "Label name is required" });
    };

    try {
        const label = await Label.findOne({ _id: labelId, userId });

        if (!label) {
            return res.status(404).json({ error: true, message: "Label not found" });
        };

        label.name = name;
        label.updatedOn = new Date();
        await label.save();

        return res.json({ error: false, label, message: "Label updated successfully" });
    } catch (error) {
        logger.error(`Error updating label: ${error.message}`);
        return res.status(500).json({ error: true, message: "Failed to update label" });
    };
};

exports.deleteLabel = async (req, res) => {
    const userId = req.user._id;
    const labelId = req.params.labelId;

    try {
        const label = await Label.findOne({ _id: labelId, userId });

        if (!label) {
            return res.status(404).json({ error: true, message: "Label not found" });
        };

        await Label.deleteOne({ _id: labelId, userId });
        return res.json({ error: false, message: "Label deleted successfully" });
    } catch (error) {
        logger.error(`Error deleting label: ${error.message}`);
        return res.status(500).json({ error: true, message: "Failed to delete label" });
    };
};