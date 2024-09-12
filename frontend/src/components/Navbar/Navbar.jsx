import React, { useState } from "react";
import "./Navbar.css";
import ProfileInfo from "../Cards/ProfileInfo";
import { useNavigate } from "react-router-dom";
import SearchBar from "../searchBar/SearchBar";

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate;

  const onLogout = () => {
    navigate("/login")
  }

  const handleSearch = () => {

  };

  const onClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="navbar">
      <div className="navbar-left">
        <h2 className="navbar-title">Notes</h2>
      </div>
      <div className="navbar-center">
        <SearchBar
          value={searchQuery}
          onChange={({ target }) => setSearchQuery(target.value)}
          handleSearch={handleSearch}
          onClearSearch={onClearSearch}
        />
      </div>
      <div className="navbar-right">
        <ProfileInfo onLogout={onLogout} />
      </div>
    </div>
  );
};

export default Navbar;