import React, { useState } from "react";
import { MdSearch, MdClose } from "react-icons/md";
import { useSearch } from "../../context/SearchContext";
import SearchModal from "./SearchModal";
import "./SearchBar.css";

const SearchBar = () => {
  const { searchQuery, handleClearSearch } = useSearch();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (searchQuery) {
    return (
      <div className="search-bar-active">
        <span>{searchQuery}</span>
        <button
          className="icon-btn clear-search-btn"
          onClick={handleClearSearch}
          aria-label="Clear search"
        >
          <MdClose />
        </button>
      </div>
    );
  };

  return (
    <>
      <button className="search-bar-trigger" onClick={() => setIsModalOpen(true)}>
        <MdSearch className="search-icon" />
        <span className="search-placeholder">Search</span>
      </button>
      <SearchModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default SearchBar;