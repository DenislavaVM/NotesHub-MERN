import React from "react";
import { Link } from "react-router-dom";
import { MdClose } from "react-icons/md";
import ProfileInfo from "../Cards/ProfileInfo";
import "./Sidebar.css";

const Sidebar = ({ isOpen, onLogout, onClose }) => {
    if (!isOpen) {
        return null;
    };

    return (
        <>
            <div className="sidebar-overlay" onClick={onClose} />
            <div className="sidebar">
                <div className="sidebar-header">
                    <ProfileInfo onLogout={onLogout} />
                    <button className="icon-btn" onClick={onClose} aria-label="Close menu">
                        <MdClose size={24} />
                    </button>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/dashboard" className="sidebar-link" onClick={onClose}>Home</Link>
                    <Link to="/labels" className="sidebar-link" onClick={onClose}>Labels</Link>
                </nav>
                <div className="sidebar-footer">
                    <button className="logout-button-mobile" onClick={onLogout}>
                        Logout
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;