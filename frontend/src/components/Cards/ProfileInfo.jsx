import React from "react";
import "./ProfileInfo.css";
import { getInitials } from "../../utils/helper";


const ProfileInfo = ({ onLogout }) => {
  
  return (
    <div className="profile-info-container">
      <div className="profile-avatar">
        {getInitials("Denislava Milanova")}
      </div>

      <div>
        <p className="profile-name">Denislava Milanova</p>
        <button className="logout-button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileInfo;
