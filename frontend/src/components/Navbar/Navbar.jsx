import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdDarkMode, MdLightMode } from "react-icons/md";

import ProfileInfo from "../Cards/ProfileInfo";
import SearchBar from "../searchBar/SearchBar";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../hooks/useAuth";
import "./Navbar.css";

const Navbar = ({
  onSearchNote = () => { },
  handleClearSearch = () => { },
  setTags = () => { },
  setSortBy = () => { },
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const onLogout = () => {
    logout();
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
        <button onClick={toggleTheme} className="theme-toggle-btn">
          {theme === "dark" ? (
            <>
              <MdLightMode /> Light
            </>
          ) : (
            <>
              <MdDarkMode /> Dark
            </>
          )}
        </button>
        {user ? (
          <ProfileInfo userInfo={user} onLogout={logout} />
        ) : (
          <Link to="/login" className="navbar-link">Login</Link>
        )}
      </div>
    </div >
  );
};

export default Navbar;