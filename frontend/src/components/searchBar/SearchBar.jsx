import React from "react";
import { FaSearch } from "react-icons/fa";
import "./SearchBar.css";

const SearchBar = ({ value, onChange, handleSearch, onClearSearch, setTags, setSortBy }) => {
  return (
    <div className="search-bar-container">
      <input
        type="text"
        placeholder="Search notes"
        className="search-bar-input"
        value={value}
        onChange={onChange}
      />
      <input
        type="text"
        placeholder="Enter tags (comma separated)"
        className="tag-input"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setTags(e.target.value.split(",").map(tag => tag.trim()));
          }
        }}
      />

      <select className="sort-select" onChange={(e) => setSortBy(e.target.value)}>
        <option value="">Sort by</option>
        <option value="created">Created Date</option>
        <option value="updated">Updated Date</option>
      </select>

      <div className="search-bar-buttons">
        <button className="search-bar-button" onClick={handleSearch}>
          <FaSearch className="search-icon" />
        </button>

        <button className="clear-button" onClick={onClearSearch}>
          Clear
        </button>
      </div>

    </div>
  );
};

export default SearchBar;