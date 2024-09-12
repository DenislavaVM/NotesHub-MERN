import React from "react";
import { FaSearch } from "react-icons/fa";
import "./SearchBar.css"; 


const SearchBar = ({ value, onChange, handleSearch, onClearSearch }) => {
  return (
    <div className="search-bar-container">
      <input
        type="text"
        placeholder="Search notes"
        className="search-bar-input"
        value={value}
        onChange={onChange}
      />
      <button className="search-bar-button" onClick={handleSearch}>
        <FaSearch className="search-icon" />
      </button>
      <button className="clear-button" onClick={onClearSearch}>
        Clear
      </button>
    </div>
  );
};

export default SearchBar;