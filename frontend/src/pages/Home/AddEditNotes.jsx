import React from "react";
import "./AddEditNotes.css"; 

const AddEditNotes = () => {
  return (
    <div className="add-edit-notes-container">
      <div className="input-group">
        <label className="input-label">Title</label>
        <input
          type="text"
          className="input-title"
          placeholder="Enter note title..."
        />
      </div>

      <div className="input-group">
        <label className="input-label">Content</label>
        <textarea
          className="textarea-content"
          placeholder="Write your content here..."
          rows={10}
        />
      </div>

      <div className="input-group">
        <label className="input-label">Tags</label>
        <input
          type="text"
          className="input-tags"
          placeholder="Enter tags separated by commas..."
        />
      </div>

      <button className="btn-primary add-btn">Add Note</button>
    </div>
  );
};

export default AddEditNotes;