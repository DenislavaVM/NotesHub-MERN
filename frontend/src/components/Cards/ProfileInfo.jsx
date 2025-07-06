import React, { useState } from "react";
import { getInitials } from "../../utils/helper";
import { useAuth } from "../../hooks/useAuth";
import "./ProfileInfo.css";

const ProfileInfo = ({ onLogout }) => {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  if (!user) {
    return null;
  }

  const userName = (user.firstName || user.lastName)
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
    : user.email || "User";

  return (
    <div className="profile-info-container">
      <button className="profile-trigger" onClick={() => setShowMenu(!showMenu)}>
        <div className="profile-avatar">
          {getInitials(userName)}
        </div>
        <span className="profile-name desktop-only">{userName}</span>
      </button>

      {showMenu && (
        <>
          <div className="profile-menu-overlay" onClick={() => setShowMenu(false)}></div>
          <div className="profile-menu">
            <p className="profile-menu-name">{userName}</p>
            <p className="profile-menu-email">{user.email}</p>
            <hr />
            <button
              className="logout-button"
              onClick={() => {
                onLogout();
                setShowMenu(false);
              }}
            >
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileInfo;