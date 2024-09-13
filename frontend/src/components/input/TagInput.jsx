import React, { useState } from "react";
import { MdAdd, MdClose } from "react-icons/md";
import "./TagInput.css";

const TagInput = ({ tags, setTags }) => {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const addNewTag = () => {
    if (inputValue.trim() !== "") {
      setTags([...tags, inputValue.trim()]);
      setInputValue("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      addNewTag();
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="tag-input-container">
      {tags?.length > 0 && (
        <div className="tag-list">
          {tags.map((tag, index) => (
            <span key={index} className="tag-item">
              # {tag}
              <button
                className="tag-button"
                onClick={() => handleRemoveTag(tag)}
              >
                <MdClose />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="tag-input-wrapper">
        <input
          type="text"
          value={inputValue}
          className="tag-input"
          placeholder="Add tags"
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        <button
          className="add-tag-button"
          onClick={() => addNewTag()}
        >
          <MdAdd />
        </button>
      </div>
    </div>
  );
};

export default TagInput;