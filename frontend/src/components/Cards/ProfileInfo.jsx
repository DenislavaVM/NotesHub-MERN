import React from "react";
import "./ProfileInfo.css";
import { getInitials } from "../../utils/helper";

const ProfileInfo = ({ userInfo, onLogout }) => {
  if (!userInfo) {
    return null;
  }

  const userName = `${userInfo.firstName} ${userInfo.lastName}`;
  const initials = getInitials(userName);

  return (
    <div className="profile-info-container">
      <div className="profile-avatar">
        {initials}
      </div>

      <div>
        <p className="profile-name">{userName}</p>
        <button className="logout-button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileInfo;
