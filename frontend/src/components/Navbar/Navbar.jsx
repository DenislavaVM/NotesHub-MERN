import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdClose, MdDarkMode, MdLightMode, MdMenu } from "react-icons/md";

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
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const lastScrollY = useRef(window.scrollY);

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

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingUp = currentScrollY < lastScrollY.current;
      if (window.innerWidth <= 768) {
        setIsNavbarVisible(isScrollingUp || currentScrollY < 10);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "auto";
  }, [isMobileMenuOpen]);

  return (
    <>
      <div className={`navbar ${isNavbarVisible ? "navbar-show" : "navbar-hide"}`}>
        <div className="navbar-left">
          <h2 className="navbar-title">Notes</h2>
          <button
            className="mobile-menu-icon"
            aria-label="Toggle mobile menu"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <MdClose size={28} /> : <MdMenu size={28} />}
          </button>
        </div>

        <div className="navbar-center desktop-only">
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            handleSearch={(query, tagsArray) => {
              handleSearch(query, tagsArray);
              setIsMobileMenuOpen(false);
            }}
            onClearSearch={onClearSearch}
            setTags={setTags}
            setSortBy={setSortBy}
          />
        </div>

        <div className="navbar-right desktop-only">
          <Link to="/labels" className="navbar-link">Labels</Link>
          <button onClick={toggleTheme} className="theme-toggle-btn">
            {theme === "dark" ? <><MdLightMode /> Light</> : <><MdDarkMode /> Dark</>}
          </button>
          {user ? (
            <ProfileInfo userInfo={user} onLogout={onLogout} />
          ) : (
            <Link to="/login" className="navbar-link">Login</Link>
          )}
        </div>
      </div>

      {isMobileMenuOpen && (
        <>
          <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="mobile-menu">
            <div className="mobile-menu-header">
              <Link to="/labels" className="navbar-link" onClick={() => setIsMobileMenuOpen(false)}>Labels</Link>
              <button onClick={toggleTheme} className="theme-toggle-btn">
                {theme === "dark" ? <><MdLightMode /> Light</> : <><MdDarkMode /> Dark</>}
              </button>
            </div>
            <hr />
            {user && <ProfileInfo userInfo={user} onLogout={onLogout} />}
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              handleSearch={handleSearch}
              onClearSearch={onClearSearch}
              setTags={setTags}
              setSortBy={setSortBy}
            />
          </div>
        </>
      )}

    </>
  );
};

export default Navbar;