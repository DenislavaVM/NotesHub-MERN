import React, { useState } from "react";
import "./Navbar.css";
import ProfileInfo from "../Cards/ProfileInfo";
import { useNavigate } from "react-router-dom";
import SearchBar from "../searchBar/SearchBar";

const Navbar = ({ userInfo, onSearchNote, handleClearSearch, setTags, setSortBy }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const onLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleSearch = () => {
    if (searchQuery) {
      onSearchNote(searchQuery);
    }
  };

  const onClearSearch = () => {
    setSearchQuery("");
    handleClearSearch();
  };

  return (
    <div className="navbar">
      <div className="navbar-left">
        <h2 className="navbar-title">Notes</h2>
      </div>
      <div className="navbar-center">
        <SearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          handleSearch={handleSearch}
          onClearSearch={onClearSearch}
          setTags={setTags}
          setSortBy={setSortBy}
        />
      </div>
      <div className="navbar-right">
        <ProfileInfo userInfo={userInfo} onLogout={onLogout} />
      </div>
    </div>
  );
};

export default Navbar;