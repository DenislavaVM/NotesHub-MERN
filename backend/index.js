require("dotenv").config();

const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI);

const User = require("./models/user.model");
const Note = require("./models/note.model");

const express = require("express");
const cors = require("cors");
const app = express();

const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./utils");

const bcrypt = require("bcrypt");
const saltRounds = 10;

app.use(express.json());

app.use(
    cors({
        origin: "*",
    })
);

app.get("/", (req, res) => {
    res.json({ data: "Hello" });
});

app.post("/create-account", async (req, res) => {

    const { firstName, lastName, email, password } = req.body;

    if (!firstName) {
        return res
            .status(400)
            .json({ error: true, message: "First name is required" });
    }

    if (!lastName) {
        return res
            .status(400)
            .json({ error: true, message: "Last name is required" });
    }

    if (!email) {
        return res
            .status(400)
            .json({ error: true, message: "Email is required" });
    }

    if (!password) {
        return res
            .status(400)
            .json({ error: true, message: "Password is required" });
    }

    const isUser = await User.findOne({ email: email });

    if (isUser) {
        return res.json({
            error: true,
            message: "User already exists",
        });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
    });

    await user.save();

    const accessToken = jwt.sign(
        { user: { _id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email } },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "36000m",
        }
    );

    return res.json({
        error: false,
        user,
        accessToken,
        message: "Registration successful",
    });
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        return res
            .status(400)
            .json({ message: "Email is required" });
    }

    if (!password) {
        return res
            .status(400)
            .json({ message: "Password is required" });
    }

    const userInfo = await User.findOne({ email });

    if (!userInfo) {
        return res
            .status(400)
            .json({ message: "User not found" })
    }

    const isPasswordValid = await bcrypt.compare(password, userInfo.password);

    if (isPasswordValid) {
        const user = { _id: userInfo._id, firstName: userInfo.firstName, lastName: userInfo.lastName, email: userInfo.email };
        const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "36000m",
        });

        return res.json({ error: false, message: "Login successful", email, accessToken });
    } else {
        return res.status(400).json({
            error: true,
            message: "Invalid credentials"
        });
    }
});

app.get("/get-user", authenticateToken, async (req, res) => {
    const user = req.user;

    const isUser = await User.findOne({ _id: user._id });

    if (!isUser) {
        return res.sendStatus(401);
    }

    return res.json({
        user: {
            firstName: isUser.firstName,
            lastName: isUser.lastName,
            email: isUser.email,
            _id: isUser._id,
            createdOn: isUser.createdOn
        },
        message: "",
    });
});

app.post("/add-note", authenticateToken, async (req, res) => {
    const { title, content, tags, isPinned } = req.body;
    const user = req.user;

    if (!title) {
        return res
            .status(400)
            .json({ error: true, message: "Title is required" })
    }

    if (!content) {
        return res
            .status(400)
            .json({ error: true, message: "Content is required" })
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

        return res.json({
            error: false,
            note,
            message: "Note added successfully",
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal server error",
        });
    }
});

app.put("/edit-note/:noteId", authenticateToken, async (req, res) => {
    const noteId = req.params.noteId;
    const { title, content, tags, isPinned } = req.body;
    const user = req.user;

    if (!title && !content && !tags) {
        return res
            .status(400)
            .json({ error: false, message: "No changes provided" });
    }

    try {
        const note = await Note.findOne({ _id: noteId, userId: user._id });

        if (!note) {
            return res
                .status(404)
                .json({ error: true, message: "Note not found" });
        }

        if (title) {
            note.title = title;
        }

        if (content) {
            note.content = content;
        }

        if (tags) {
            note.tags = tags;
        }

        if (isPinned) {
            note.isPinned = isPinned;
        }

        await note.save();

        return res.json({
            error: false,
            note,
            message: "Note updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal server error",
        });
    }
});

app.get("/get-all-notes", authenticateToken, async (req, res) => {
    const user = req.user;
    const { searchQuery, tags, sortBy } = req.query;

    if (!user || !user._id) {
        return res.status(400).json({
            error: true,
            message: "User not authenticated or missing user ID",
        });
    }

    try {
        let filter = { userId: user._id };

        if (searchQuery) {
            filter.$or = [
                { title: { $regex: new RegExp(searchQuery, "i") } },
                { content: { $regex: new RegExp(searchQuery, "i") } }
            ];
        }

        if (tags) {
            filter.tags = { $in: tags.split(",") };
        }

        let sortOptions = { isPinned: -1 };
        if (sortBy === "created") {
            sortOptions = { createdOn: -1 };
        } else if (sortBy === "updated") {
            sortOptions = { updatedOn: -1 };
        }

        const notes = await Note.find(filter).sort(sortOptions);

        return res.json({
            error: false,
            notes,
            message: "All notes retrieved seccessfully",
        });

    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal server error",
        });
    }
});

app.delete("/delete-note/:noteId", authenticateToken, async (req, res) => {
    const noteId = req.params.noteId;
    const user = req.user;

    try {
        const note = await Note.findOne({ _id: noteId, userId: user._id });

        if (!note) {
            return res
                .status(404)
                .json({
                    error: true,
                    message: "Note not found"
                });
        }
        await Note.deleteOne({ _id: noteId, userId: user._id })


        return res.json({
            error: false,
            message: "Note deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal server error",
        });
    }
});

app.put("/update-note-pinned/:noteId", authenticateToken, async (req, res) => {
    const noteId = req.params.noteId;
    const { isPinned } = req.body;
    const user = req.user;

    try {
        const note = await Note.findOne({ _id: noteId, userId: user._id });

        if (!note) {
            return res
                .status(404)
                .json({ error: true, message: "Note not found" });
        }

        note.isPinned = isPinned;

        await note.save();

        return res.json({
            error: false,
            note,
            message: "Note updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal server error",
        });
    }
});

app.get("/search-notes", authenticateToken, async (req, res) => {
    const user = req.user;
    const { query } = req.query;

    if (!query) {
        return res
            .status(400)
            .json({ error: true, message: "Search query is required" });
    }

    try {
        const matchingNotes = await Note.find({
            userId: user._id,
            $or: [
                { title: { $regex: new RegExp(query, "i") } },
                { content: { $regex: new RegExp(query, "i") } },
            ],
        });

        return res.json({
            error: false,
            notes: matchingNotes,
            message: "Notes matching the search query retrieved successfully",
        });

    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal server error",
        });
    }
});

app.put("/archive-note/:noteId", authenticateToken, async (req, res) => {
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
});

app.put("/complete-note/:noteId", authenticateToken, async (req, res) => {
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
});

app.put("/add-label/:noteId", authenticateToken, async (req, res) => {
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

        return res.json({
            error: false,
            note,
            message: "Label added successfully",
        });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal server error" });
    }
});

app.put("/remove-label/:noteId", authenticateToken, async (req, res) => {
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

        return res.json({
            error: false,
            note,
            message: "Label removed successfully",
        });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal server error" });
    }
});

app.listen(3000, () => console.log("Server started on port 3000"));

module.exports = app;
