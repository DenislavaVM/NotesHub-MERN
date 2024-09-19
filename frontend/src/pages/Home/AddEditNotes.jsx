import React, { useState } from "react";
import "./AddEditNotes.css";
import TagInput from "../../components/input/TagInput";
import { MdClose } from "react-icons/md";
import apiClient from "../../utils/apiClient";

const AddEditNotes = ({ noteData, type, getAllNotes, onClose }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [error, setError] = useState(null);

  const addNewNode = async () => {
    try {
      const response = await apiClient.post("/add-note", {
        title,
        content,
        tags,
      });

      if (response.data && response.data.note) {
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
    // Logic to edit a note
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
        <label className="input-label">Tags</label>
        <TagInput tags={tags} setTags={setTags} />
      </div>

      {error && <p className="error-message">{error}</p>}

      <button className="btn-primary add-btn" onClick={handleAddNote}>
        Add Note
      </button>
    </div>
  );
};

export default AddEditNotes;