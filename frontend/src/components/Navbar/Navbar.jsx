import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { MdDarkMode, MdLightMode, MdMenu } from "react-icons/md";
import ProfileInfo from "../Cards/ProfileInfo";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../hooks/useAuth";
import NotificationBell from "./NotificationBell";
import Sidebar from "../Sidebar/Sidebar";
import "./Navbar.css";
import SearchBar from "../SearchBar/SearchBar";

const Navbar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const location = useLocation();

    const onLogout = async () => {
        await logout();
        setIsSidebarOpen(false);
    };

    useEffect(() => {
        document.body.style.overflow = isSidebarOpen ? "hidden" : "auto";
    }, [isSidebarOpen]);

    if (["/login", "/signup"].includes(location.pathname)) {
        return null;
    }

    return (
        <>
            <div className="navbar">
                <div className="navbar-left">
                    <button className="icon-btn mobile-only" onClick={() => setIsSidebarOpen(prev => !prev)}>
                        <MdMenu size={24} />
                    </button>
                    {user && <ProfileInfo onLogout={onLogout} />}
                </div>
                <div className="navbar-spacer" />

                <div className="navbar-right">
                    <SearchBar />
                    <Link to="/labels" className="navbar-link desktop-only">Labels</Link>
                    <button onClick={toggleTheme} className="icon-btn" aria-label="Toggle theme">
                        {theme === "dark" ? <MdLightMode size={22} /> : <MdDarkMode size={22} />}
                    </button>
                    <NotificationBell />
                </div>
            </div>

            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onLogout={onLogout}
            />
        </>
    );
};

export default Navbar;