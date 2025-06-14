import React, { useState, useEffect, useCallback } from "react";
import { FaSearch } from "react-icons/fa";
import { TextField, Button, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import "./SearchBar.css";

const SearchBar = ({ value, onChange, handleSearch, onClearSearch, setSortBy, sortBy }) => {
  const [tagInput, setTagInput] = useState("");
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  const debounceSearch = useCallback((query, tags) => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const newTimeout = setTimeout(() => {
      handleSearch(query, tags);
    }, 500);

    setDebounceTimeout(newTimeout);
  }, [debounceTimeout, handleSearch]);

  useEffect(() => {
    if (!value && !tagInput) {
      return;
    };

    const tagsArray = tagInput
      .split(",")
      .map(tag => tag.trim())
      .filter(tag => tag !== "");

    const timeout = setTimeout(() => {
      handleSearch(value, tagsArray);
    }, 500);

    return () => clearTimeout(timeout);
  }, [value, tagInput]);

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
      e.preventDefault();
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
      <TextField
        label="Search notes"
        variant="outlined"
        fullWidth
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyPress}
      />
      <TextField
        label="Enter tags"
        variant="outlined"
        fullWidth
        value={tagInput}
        onChange={(e) => setTagInput(e.target.value)}
        onKeyDown={handleKeyPress}
      />

      <FormControl fullWidth variant="outlined">
        <InputLabel>Sort by</InputLabel>
        <Select
          label="Sort by"
          value={sortBy || ""}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <MenuItem value="">None</MenuItem>
          <MenuItem value="created">Created Date</MenuItem>
          <MenuItem value="updated">Updated Date</MenuItem>
        </Select>
      </FormControl>

      <div className="search-bar-buttons">
        <Button variant="contained" color="primary" onClick={handleSearchClick}>
          <FaSearch className="search-icon" /> Search
        </Button>

        <Button variant="outlined" color="secondary" onClick={handleClearClick}>
          Clear
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;