import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProfileInfo from "../Cards/ProfileInfo";
import SearchBar from "../searchBar/SearchBar";
import "./Navbar.css";

const Navbar = ({ userInfo, onSearchNote, handleClearSearch, setTags, setSortBy }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const onLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleSearch = (searchQuery, tagsArray) => {
    onSearchNote(searchQuery, tagsArray);
  };

  const onClearSearch = () => {
    setSearchQuery("");
    handleClearSearch();
  };

  return (
    <div className="navbar">
      <div className="navbar-left">
        <h2 className="navbar-title">Notes</h2>
        <Link to="/labels" className="navbar-link">
          Labels
        </Link>
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