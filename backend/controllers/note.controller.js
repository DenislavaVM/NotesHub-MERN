const Note = require("../models/note.model");
const { findUserNote, findAndUpdateNote, getNoteByIdWithUser } = require("../helpers/noteHelpers");
const Label = require("../models/label.model");
const logger = require("../logger");
const { errors, success } = require("../config/messages");

exports.addNote = async (req, res, next) => {
  const { title, content, tags = [], isPinned } = req.body;
  const user = req.user;

  if (!title || !content) {
    return res.status(400).json({ error: true, message: errors.titleContentRequired });
  }

  try {
    const labelDocs = await Label.find({ name: { $in: tags }, userId: user._id }, "_id");
    const tagIds = labelDocs.map(l => l._id);

    const note = await Note.create({
      title,
      content,
      tags: tagIds,
      isPinned: !!isPinned,
      userId: user._id,
    });

    const populatedNote = await getNoteByIdWithUser(note._id);
    logger.info(`Note added by user: ${user.email}`);
    return res.json({ error: false, note: populatedNote, message: success.noteAdded });
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
    return res.status(400).json({ error: true, message: "No changes provided" });
  }

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });
    if (!note) {
      return res.status(404).json({ error: true, message: errors.noteNotFound });
    }

    if (title) note.title = title;
    if (content) note.content = content;
    if (Array.isArray(tags)) {
      const labelDocs = await Label.find({ name: { $in: tags }, userId: user._id }, "_id");
      note.tags = labelDocs.map(l => l._id);
    };

    if (reminder) note.reminder = reminder;
    if (typeof isPinned !== "undefined") note.isPinned = isPinned;

    await note.save();
    const populatedNote = await getNoteByIdWithUser(note._id);
    return res.json({ error: false, note: populatedNote, message: success.noteUpdated });
  } catch (error) {
    return res.status(500).json({ error: true, message: errors.internal });
  }
};

exports.getAllNotes = async (req, res) => {
  const user = req.user;
  const { searchQuery, tags, sortBy, page = 1, limit = 10 } = req.query;

  if (!user || !user._id) {
    return res.status(400).json({ error: true, message: errors.authRequired });
  }

  try {
    const baseAccess = { $or: [{ userId: user._id }, { sharedWith: user.email }] };
    const conditions = [baseAccess];

    if (searchQuery) {
      conditions.push({
        $or: [
          { title: { $regex: searchQuery, $options: "i" } },
          { content: { $regex: searchQuery, $options: "i" } },
        ],
      });
    };

    if (tags && tags !== "") {
      const tagNames = tags.split(",").map(t => t.trim());
      const labelDocs = await Label.find({ name: { $in: tagNames }, userId: user._id }, "_id");
      const labelIds = labelDocs.map(l => l._id);
      if (labelIds.length) conditions.push({ tags: { $in: labelIds } });
    }

    const filter = conditions.length > 1 ? { $and: conditions } : baseAccess;

    let sortOptions = { isPinned: -1, createdOn: -1 };
    if (sortBy === "created") sortOptions = { createdOn: -1 };
    else if (sortBy === "updated") sortOptions = { updatedOn: -1 };

    const pageNum = Number(page) || 1;
    const pageSize = Number(limit) || 10;

    const totalCount = await Note.countDocuments(filter);
    const notes = await Note.find(filter)
      .populate("userId", "firstName lastName email")
      .populate("tags", "name")
      .sort(sortOptions)
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .lean();

    return res.json({
      error: false,
      notes,
      currentPage: pageNum,
      totalPages: Math.ceil(totalCount / pageSize),
      totalCount,
      message: success.notesFetched,
    });
  } catch (error) {
    return res.status(500).json({ error: true, message: errors.internal });
  };
};

exports.deleteNote = async (req, res) => {
  const noteId = req.params.noteId;
  const user = req.user;

  try {
    const note = await findUserNote(noteId, user._id);
    if (!note) {
      return res.status(404).json({ error: true, message: errors.noteNotFound });
    };

    await Note.deleteOne({ _id: noteId, userId: user._id });
    return res.json({ error: false, message: success.noteDeleted });
  } catch (error) {
    return res.status(500).json({ error: true, message: errors.internal });
  };
};

exports.updateNotePinned = async (req, res) => {
  const noteId = req.params.noteId;
  const { isPinned } = req.body;
  const user = req.user;

  try {
    await findAndUpdateNote(noteId, user._id, { isPinned });
    return res.json({ error: false, message: success.noteUpdated });
  } catch (error) {
    return res.status(500).json({ error: true, message: errors.internal });
  };
};

exports.archiveNote = async (req, res) => {
  const noteId = req.params.noteId;
  const { isArchived } = req.body;
  const user = req.user;

  try {
    await findAndUpdateNote(noteId, user._id, { isArchived });
    const msg = isArchived ? success.archived : success.unarchived;
    return res.json({ error: false, message: msg });
  } catch (error) {
    return res.status(500).json({ error: true, message: errors.internal });
  };
};

exports.completeNote = async (req, res) => {
  const noteId = req.params.noteId;
  const { isCompleted } = req.body;
  const user = req.user;

  try {
    await findAndUpdateNote(noteId, user._id, { isCompleted });
    const msg = isCompleted ? success.completed : success.uncompleted;
    return res.json({ error: false, message: msg });
  } catch (error) {
    return res.status(500).json({ error: true, message: errors.internal });
  };
};

exports.addLabel = async (req, res) => {
  const noteId = req.params.noteId;
  const { label } = req.body;
  const user = req.user;

  if (!label || label.trim() === "") {
    return res.status(400).json({ error: true, message: errors.labelRequired });
  };

  try {
    const labelDoc = await Label.findOne({ name: label, userId: user._id });
    if (!labelDoc) {
      return res.status(404).json({ error: true, message: "Label not found" });
    };

    const note = await Note.findOne({ _id: noteId, userId: user._id });
    if (!note) {
      return res.status(404).json({ error: true, message: errors.noteNotFound });
    };

    if (!note.tags.some(id => id.equals(labelDoc._id))) {
      note.tags.push(labelDoc._id);
      await note.save();
    };

    const populatedNote = await getNoteByIdWithUser(note._id);
    return res.json({ error: false, note: populatedNote, message: success.labelAdded });
  } catch (error) {
    return res.status(500).json({ error: true, message: errors.internal });
  };
};

exports.removeLabel = async (req, res) => {
  const noteId = req.params.noteId;
  const { label } = req.body;
  const user = req.user;

  if (!label || label.trim() === "") {
    return res.status(400).json({ error: true, message: errors.labelRequired });
  };

  try {
    const labelDoc = await Label.findOne({ name: label, userId: user._id });
    if (!labelDoc) {
      return res.status(404).json({ error: true, message: "Label not found" });
    };

    const note = await Note.findOne({ _id: noteId, userId: user._id });
    if (!note) {
      return res.status(404).json({ error: true, message: errors.noteNotFound });
    };

    note.tags = note.tags.filter(id => !id.equals(labelDoc._id));
    await note.save();

    const populatedNote = await getNoteByIdWithUser(note._id);
    return res.json({ error: false, note: populatedNote, message: success.labelRemoved });
  } catch (error) {
    return res.status(500).json({ error: true, message: errors.internal });
  };
};

exports.setReminder = async (req, res) => {
  const noteId = req.params.noteId;
  const { reminder } = req.body;
  const user = req.user;

  try {
    const note = await findAndUpdateNote(noteId, user._id, { reminder });
    return res.json({ error: false, note, message: success.reminderSet });
  } catch (error) {
    return res.status(404).json({ error: true, message: error.message || errors.noteNotFound });
  }
};

exports.shareNote = async (req, res) => {
  const noteId = req.params.noteId;
  const { emails } = req.body;
  const user = req.user;

  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ error: true, message: errors.emailsRequired });
  }

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });
    if (!note) {
      return res.status(404).json({ error: true, message: errors.noteNotFound });
    }

    const newEmails = emails.filter(email => !note.sharedWith.includes(email));
    if (newEmails.length) {
      note.sharedWith.push(...newEmails);
      await note.save();
    }

    const populatedNote = await getNoteByIdWithUser(note._id);
    return res.json({ error: false, note: populatedNote, message: success.shared });
  } catch (error) {
    return res.status(500).json({ error: true, message: errors.internal });
  }
};