import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import "./SearchBar.css";

const SearchBar = ({ value, onChange, handleSearch, onClearSearch, setSortBy }) => {
  const [tagInput, setTagInput] = useState("");

  const handleSearchClick = () => {
    const searchQuery = value;
    const tagsArray = tagInput
      .split(",")
      .map(tag => tag.trim())
      .filter(tag => tag !== "");

    handleSearch(searchQuery, tagsArray);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearchClick();
    }
  };

  const handleClearClick = () => {
    setTagInput("");
    onChange({ target: { value: "" } });
    onClearSearch();
  };

  return (
    <div className="search-bar-container">
      <input
        type="text"
        placeholder="Search notes"
        className="search-bar-input"
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyPress}
      />
      <input
        type="text"
        placeholder="Enter tags (comma separated)"
        className="tag-input"
        value={tagInput}
        onChange={(e) => setTagInput(e.target.value)}
        onKeyDown={handleKeyPress}
      />

      <select className="sort-select" onChange={(e) => setSortBy(e.target.value)}>
        <option value="">Sort by</option>
        <option value="created">Created Date</option>
        <option value="updated">Updated Date</option>
      </select>

      <div className="search-bar-buttons">
        <button className="search-bar-button" onClick={handleSearchClick}>
          <FaSearch className="search-icon" />
        </button>

        <button className="clear-button" onClick={handleClearClick}>
          Clear
        </button>
      </div>

    </div>
  );
};

export default SearchBar;