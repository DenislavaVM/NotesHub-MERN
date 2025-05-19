const Note = require("../models/note.model");
const User = require("../models/user.model");
const logger = require("../logger");

exports.addNote = async (req, res, next) => {
  const { title, content, tags, isPinned } = req.body;
  const user = req.user;

  if (!title || !content) {
    const error = new Error("Title and content are required");
    error.status = 400;
    return next(error);
  }

  try {
    const note = new Note({
      title,
      content,
      tags: tags || [],
      isPinned: isPinned || false,
      userId: user._id,
    });

    await note.save();
    logger.info(`Note added by user: ${user.email}`);
    return res.json({ error: false, note, message: "Note added successfully" });
  } catch (error) {
    logger.error(`Error adding note: ${error.message}`);
    next(error);
  }
};

exports.editNote = async (req, res) => {
  const noteId = req.params.noteId;
  const { title, content, tags, reminder, isPinned } = req.body;
  const user = req.user;

  if (!title && !content && !tags && typeof isPinned === "undefined" && !reminder) {
    return res.status(400).json({ error: false, message: "No changes provided" });
  }

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    if (title) note.title = title;
    if (content) note.content = content;
    if (tags && Array.isArray(tags)) note.tags = tags;
    if (reminder) note.reminder = reminder;
    if (isPinned !== undefined) note.isPinned = isPinned;

    await note.save();

    return res.json({ error: false, note, message: "Note updated successfully" });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Internal server error" });
  }
};

exports.getAllNotes = async (req, res) => {
  const user = req.user;
  const { searchQuery, tags, sortBy } = req.query;

  if (!user || !user._id) {
    return res.status(400).json({
      error: true,
      message: "User not authenticated or missing user ID",
    });
  }

  try {
    let filter = {
      $or: [
        { userId: user._id },
        { sharedWith: user.email }
      ]
    };

    if (searchQuery) {
      filter.$or = [
        { title: { $regex: new RegExp(searchQuery, "i") } },
        { content: { $regex: new RegExp(searchQuery, "i") } },
      ];
    }

    if (tags && tags !== "") {
      const tagsArray = tags.split(",").map((tag) => tag.trim());
      filter.tags = { $in: tagsArray };
    }

    let sortOptions = { isPinned: -1 };
    if (sortBy === "created") {
      sortOptions = { createdOn: -1 };
    } else if (sortBy === "updated") {
      sortOptions = { updatedOn: -1 };
    }

    const notes = await Note.find(filter).sort(sortOptions);

    return res.json({ error: false, notes, message: "All notes retrieved successfully" });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Internal server error" });
  }
};

exports.deleteNote = async (req, res) => {
  const noteId = req.params.noteId;
  const user = req.user;

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    await Note.deleteOne({ _id: noteId, userId: user._id });

    return res.json({ error: false, message: "Note deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Internal server error" });
  }
};

exports.updateNotePinned = async (req, res) => {
  const noteId = req.params.noteId;
  const { isPinned } = req.body;
  const user = req.user;

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    note.isPinned = isPinned;

    await note.save();

    return res.json({ error: false, note, message: "Note updated successfully" });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Internal server error" });
  }
};

exports.archiveNote = async (req, res) => {
  const noteId = req.params.noteId;
  const { isArchived } = req.body;
  const user = req.user;

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    note.isArchived = isArchived;
    await note.save();

    return res.json({
      error: false,
      note,
      message: isArchived ? "Note archived successfully" : "Note unarchived successfully",
    });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Internal server error" });
  }
};

exports.completeNote = async (req, res) => {
  const noteId = req.params.noteId;
  const { isCompleted } = req.body;
  const user = req.user;

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    note.isCompleted = isCompleted;
    await note.save();

    return res.json({
      error: false,
      note,
      message: isCompleted ? "Note marked as completed" : "Note marked as incomplete",
    });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Internal server error" });
  }
};

exports.addLabel = async (req, res) => {
  const noteId = req.params.noteId;
  const { label } = req.body;
  const user = req.user;

  if (!label || label.trim() === "") {
    return res.status(400).json({ error: true, message: "Label is required" });
  }

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    if (!note.tags.includes(label)) {
      note.tags.push(label);
      await note.save();
    }

    return res.json({ error: false, note, message: "Label added successfully" });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Internal server error" });
  }
};

exports.removeLabel = async (req, res) => {
  const noteId = req.params.noteId;
  const { label } = req.body;
  const user = req.user;

  if (!label || label.trim() === "") {
    return res.status(400).json({ error: true, message: "Label is required" });
  }

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    note.tags = note.tags.filter((tag) => tag !== label);
    await note.save();

    return res.json({ error: false, note, message: "Label removed successfully" });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Internal server error" });
  }
};

exports.setReminder = async (req, res) => {
  const noteId = req.params.noteId;
  const { reminder } = req.body;
  const user = req.user;

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    note.reminder = reminder;
    await note.save();

    return res.json({ error: false, note, message: "Reminder set successfully" });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Internal server error" });
  }
};

exports.shareNote = async (req, res) => {
  const noteId = req.params.noteId;
  const { emails } = req.body;
  const user = req.user;

  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ error: true, message: "Emails are required" });
  };

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found or access denied" });
    };

    const newEmails = emails.filter(email => !note.sharedWith.includes(email));
    note.sharedWith.push(...newEmails);
    await note.save();

    return res.json({ error: false, note, message: "Note shared successfully" });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Internal server error" });
  };
};