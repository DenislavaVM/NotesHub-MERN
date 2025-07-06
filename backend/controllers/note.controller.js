const Note = require("../models/note.model");
const Label = require("../models/label.model");
const User = require("../models/user.model");
const logger = require("../logger");
const { createNotification } = require("./notification.controller");
const { getNoteByIdWithUser } = require("../helpers/noteHelpers");
const { errors, success } = require("../config/messages");
const {
  ValidationError,
  NotFoundError
} = require("../errors");

exports.addNote = async (req, res, next) => {
  const { title, content, labels = [], isPinned, color } = req.body;
  const user = req.user;

  try {
    let labelIds = [];
    if (labels.length > 0) {
      const foundLabels = await Label.find({
        name: { $in: labels },
        userId: user._id
      });

      if (foundLabels.length !== labels.length) {
        throw new ValidationError("One or more labels are invalid.");
      };

      labelIds = foundLabels.map(label => label._id);
    };

    const note = new Note({
      title,
      content,
      labels: labelIds,
      isPinned: isPinned || false,
      color,
      userId: user._id,
    });

    await note.save();
    const populatedNote = await getNoteByIdWithUser(note._id);

    logger.info(`Note added by user: ${user.email}`);
    res.status(201).json({
      success: true,
      data: populatedNote,
      message: "Note added successfully"
    });
  } catch (error) {
    logger.error(`Error adding note: ${error.message}`);
    next(error);
  };
};

exports.editNote = async (req, res, next) => {
    const noteId = req.params.noteId;
    const { title, content, labels, reminder, isPinned, color } = req.body;
    const user = req.user;

    try {
        const note = await Note.findOne({
            _id: noteId,
            $or: [
                { userId: user._id },
                { sharedWith: user.email }
            ],
        });

        if (!note) {
            throw new NotFoundError("Note not found or you don't have permission to edit it.");
        };

        const isOwner = note.userId.toString() === user._id.toString();

        if (title) {
            note.title = title;
        };

        if (content) {
            note.content = content;
        };

        if (color) {
            note.color = color;
        };

        if (Array.isArray(labels)) {
            if (labels.length > 0) {
                const foundLabels = await Label.find({
                    name: { $in: labels },
                     userId: note.userId 
                });

                if (foundLabels.length !== labels.length) {
                    throw new ValidationError("One or more labels are invalid.");
                };

                note.labels = foundLabels.map(label => label._id);
            } else {
                note.labels = [];
            };
        };

        if (isOwner) {
            if (reminder !== undefined) {
                note.reminder = reminder;
            };

            if (typeof isPinned !== "undefined") {
                note.isPinned = isPinned;
            }
        };

        await note.save();
        const populatedNote = await getNoteByIdWithUser(note._id);
        res.json({
            success: true,
            data: populatedNote,
            message: "Note updated successfully"
        });
    } catch (error) {
        next(error);
    };
};

exports.getAllNotes = async (req, res, next) => {
  const user = req.user;
  const { searchQuery, labels, sortBy, page = 1, limit = 10 } = req.query;

  try {
    const pageLimit = Math.min(parseInt(limit), 50);
    const skip = (page - 1) * pageLimit;

    const filter = {
      $and: [
        {
          $or: [
            { userId: user._id },
            { sharedWith: user.email }
          ]
        }
      ]
    };

    if (searchQuery) {
      filter.$and.push({
        $or: [
          { title: { $regex: searchQuery, $options: "i" } },
          { content: { $regex: searchQuery, $options: "i" } }
        ]
      });
    };

    if (labels && labels !== "") {
      const labelsArray = labels.split(",").map(label => label.trim());
      const labelDocs = await Label.find({
        name: { $in: labelsArray },
        userId: user._id
      }, "_id");
      const labelIds = labelDocs.map(label => label._id);
      filter.$and.push({ labels: { $in: labelIds } });
    };

    const sortOptions = { isPinned: -1 };
    if (sortBy === "created") {
      sortOptions.createdAt = -1;
    } else {
      sortOptions.updatedAt = -1;
    };

    const totalCount = await Note.countDocuments(filter);
    const notes = await Note.find(filter)
      .populate("labels", "name")
      .populate("userId", "firstName lastName email")
      .sort(sortOptions)
      .skip(skip)
      .limit(pageLimit);

    res.json({
      success: true,
      notes,
      currentPage: Number(page),
      totalPages: Math.ceil(totalCount / pageLimit),
      totalCount,
      message: success.notesFetched
    });
  } catch (error) {
    next(error);
  };
};

exports.deleteNote = async (req, res, next) => {
  const noteId = req.params.noteId;
  const user = req.user;

  try {
    const result = await Note.deleteOne({ _id: noteId, userId: user._id });
    if (result.deletedCount === 0) {
      throw new NotFoundError(errors.noteNotFound);
    };

    res.json({ success: true, message: success.noteDeleted });
  } catch (error) {
    next(error);
  };
};

exports.updateNotePinned = async (req, res, next) => {
  const { noteId } = req.params;
  const { isPinned } = req.body;

  try {
    const note = await Note.findOneAndUpdate(
      { _id: noteId, userId: req.user._id },
      { isPinned },
      { new: true }
    );

    if (!note) {
      throw new NotFoundError("Note", noteId);
    };
    res.json({ success: true, message: success.noteUpdated, data: note });
  } catch (error) {
    next(error);
  };
};

exports.archiveNote = async (req, res, next) => {
  const { noteId } = req.params;
  const { isArchived } = req.body;

  try {
    const note = await Note.findOneAndUpdate(
      { _id: noteId, userId: req.user._id },
      { isArchived }
    );

    if (!note) {
      throw new NotFoundError("Note", noteId);
    };

    const message = isArchived ? success.archived : success.unarchive;
    res.json({ success: true, message });
  } catch (error) {
    next(error);
  };
};

exports.completeNote = async (req, res, next) => {
  const { noteId } = req.params;
  const { isCompleted } = req.body;

  try {
    const note = await Note.findOneAndUpdate(
      { _id: noteId, userId: req.user._id },
      { isCompleted }
    );

    if (!note) {
      throw new NotFoundError("Note", noteId);
    };

    const message = isCompleted ? success.completed : success.uncompleted;
    res.json({ success: true, message });
  } catch (error) {
    next(error);
  };
};

exports.addLabel = async (req, res, next) => {
  const noteId = req.params.noteId;
  const { label } = req.body;
  const user = req.user;

  try {
    const note = await Note.findOne({
      _id: noteId,
      $or: [{ userId: user._id }, { sharedWith: user.email }]
    });

    if (!note) {
      throw new NotFoundError("Note not found or you don't have permission to edit it.");
    };

    const labelDoc = await Label.findOne({ name: label, userId: user._id });
    if (!labelDoc) {
      throw new NotFoundError(`Label "${label}" does not exist for this note's owner.`);
    };

    await Note.updateOne(
      { _id: noteId },
      { $addToSet: { labels: labelDoc._id } }
    );

    const populatedNote = await getNoteByIdWithUser(noteId);
    res.json({ success: true, note: populatedNote, message: success.labelAdded });
  } catch (error) {
    next(error);
  };
};

exports.removeLabel = async (req, res, next) => {
  const noteId = req.params.noteId;
  const { label } = req.body;
  const user = req.user;

  try {
    const note = await Note.findOne({
      _id: noteId,
      $or: [{ userId: user._id }, { sharedWith: user.email }]
    });

    if (!note) {
      throw new NotFoundError("Note not found or you don't have permission to edit it.");
    };

    const labelDoc = await Label.findOne({ name: label, userId: user._id });
    if (!labelDoc) {
      throw new NotFoundError("Label not found on this note.");
    };

    await Note.updateOne(
      { _id: noteId },
      { $pull: { labels: labelDoc._id } }
    );

    const populatedNote = await getNoteByIdWithUser(noteId);
    res.json({ success: true, note: populatedNote, message: success.labelRemoved });
  } catch (error) {
    next(error);
  };
};

exports.setReminder = async (req, res, next) => {
  const noteId = req.params.noteId;
  const { reminder } = req.body;
  const user = req.user;

  try {
    const updatedNote = await Note.findOneAndUpdate(
      { _id: noteId, $or: [{ userId: user._id }, { sharedWith: user.email }] },
      { reminder },
      { new: true }
    );

    if (!updatedNote) {
      throw new NotFoundError("Note not found or you don't have permission to edit it.");
    };

    const populatedNote = await getNoteByIdWithUser(updatedNote._id);
    res.json({ success: true, note: populatedNote, message: success.reminderSet });
  } catch (error) {
    next(error);
  };
};

exports.shareNote = async (req, res, next) => {
  const noteId = req.params.noteId;
  const { emails } = req.body;
  const sender = req.user;

  try {
    const note = await Note.findOne({ _id: noteId, userId: sender._id });
    if (!note) {
      throw new NotFoundError("Note not found or you don't have permission to share it.");
    };

    const recipients = await User.find({ email: { $in: emails } });
    if (recipients.length !== emails.length) {
      const foundEmails = recipients.map(r => r.email);
      const notFoundEmails = emails.filter(e => !foundEmails.includes(e));
      throw new NotFoundError(`User(s) not found: ${notFoundEmails.join(", ")}`);
    };

    const result = await Note.updateOne(
      { _id: noteId },
      { $addToSet: { sharedWith: { $each: emails } } }
    );

    for (const recipient of recipients) {
      const notificationData = {
        userId: recipient._id,
        senderId: sender._id,
        noteId: note._id,
        type: "note-shared",
        message: `${sender.firstName} shared a note with you: "${note.title}"`
      };
      await createNotification(notificationData);
      const userRoom = `user_${recipient._id}`;
      req.io.to(userRoom).emit("new_notification", notificationData);
    };

    const populatedNote = await getNoteByIdWithUser(noteId);
    res.json({ success: true, note: populatedNote, message: success.shared });
  } catch (error) {
    next(error);
  };
};