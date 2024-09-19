import React, { useEffect } from "react";
import { LuCheck } from "react-icons/lu";
import { MdDeleteOutline } from "react-icons/md";
import "./Notification.css";

const Notification = ({ isShown, message, type, onClose }) => {

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onClose();
    }, 3000);
    return () => {
      clearTimeout(timeoutId);
    }
  }, [onClose])


  return (
    <div className={`notification-container ${isShown ? "notification-visible" : "notification-hidden"}`}>
      <div className={`notification-content ${type === "delete" ? "notification-delete" : "notification-success"}`}>
        <div className="notification-body">
          <div className={`notification-icon ${type === "delete" ? "icon-delete" : "icon-success"}`}>
            {type === "delete" ? (
              <MdDeleteOutline className="icon-delete-color" />
            ) : (
              <LuCheck className="icon-success-color" />
            )}
          </div>
          <p className="notification-message">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default Notification;
