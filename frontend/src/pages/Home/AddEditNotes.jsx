import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdClose } from "react-icons/md";
import { FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText } from "@mui/material";
import apiClient from "../../utils/apiClient";
import "./AddEditNotes.css";

const AddEditNotes = ({ noteData, type, getAllNotes, onClose, showNotificationMessage }) => {
  const [title, setTitle] = useState(noteData?.title || "");
  const [content, setContent] = useState(noteData?.content || "");
  const [tags, setTags] = useState(
    noteData?.tags?.map((tag) => (typeof tag === "string" ? tag : tag._id)) || []
  );
  const [reminder, setReminder] = useState(noteData?.reminder || "");
  const [error, setError] = useState(null);
  const [availableLabels, setAvailableLabels] = useState([]);
  const navigate = useNavigate();

  const handleManageLabelsClick = () => {
    navigate("/labels", {
      state: {
        from: "addEditNote",
        noteData,
        type: type || "add"
      }
    });
  };

  const addNewNode = async () => {
    try {
      const response = await apiClient.post("/add-note", {
        title,
        content,
        tags,
        reminder,
      });

      if (response.data && response.data.note) {
        showNotificationMessage("Note added successfully");
        getAllNotes();
        onClose();
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      }
    }
  };

  const editNote = async () => {
    const noteId = noteData._id;

    try {
      const response = await apiClient.put("/edit-note/" + noteId, {
        title,
        content,
        tags,
        reminder,
      });

      if (response.data && response.data.note) {
        showNotificationMessage("Note updated successfully");
        getAllNotes();
        onClose();
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      }
    }
  };

  const handleAddNote = () => {
    if (!title) {
      setError("Please enter the title");
      return;
    }

    if (!content) {
      setError("Please enter the content");
      return;
    }

    setError("");

    if (type === "edit") {
      editNote();
    } else {
      addNewNode();
    }
  };

  useEffect(() => {
    const fetchLabels = async () => {
      try {
        const response = await apiClient.get("/labels");
        if (response.data?.labels) {
          setAvailableLabels(response.data.labels);
        }
      } catch (error) {
        console.error("Error loading labels", error);
      }
    };
    fetchLabels();
  }, []);


  return (
    <div className="add-edit-notes-container">
      <button className="close-button" onClick={onClose}>
        <MdClose className="close-icon" />
      </button>

      <div className="input-group">
        <label className="input-label">Title</label>
        <input
          type="text"
          className="input-title"
          placeholder="Enter note title..."
          value={title}
          onChange={({ target }) => setTitle(target.value)}
        />
      </div>

      <div className="input-group">
        <label className="input-label">Content</label>
        <textarea
          className="textarea-content"
          placeholder="Write your content here..."
          rows={10}
          value={content}
          onChange={({ target }) => setContent(target.value)}
        />
      </div>

      <div className="input-group">
        <FormControl fullWidth>
          <InputLabel>Labels</InputLabel>
          <Select
            multiple
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            renderValue={(selected) =>
              selected
                .map((id) => {
                  const label = availableLabels.find((label) => label._id === id);
                  return label ? label.name : "";
                })
                .join(", ")
            }
          >
            {availableLabels.map((label) => (
              <MenuItem key={label._id} value={label._id}>
                <Checkbox checked={tags.includes(label._id)} />
                <ListItemText primary={label.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <div className="manage-labels-link">
          <button onClick={handleManageLabelsClick} className="link-button">Manage Labels</button>
        </div>
      </div>

      <div className="input-group">
        <label className="input-label">Set Reminder</label>
        <input
          type="datetime-local"
          value={reminder}
          onChange={({ target }) => setReminder(target.value)}
        />
      </div>

      {error && <p className="error-message">{error}</p>}

      <button className="btn-primary add-btn" onClick={handleAddNote}>
        {type === "edit" ? "Update Note" : "Add Note"}
      </button>
    </div>
  );
};

export default AddEditNotes;