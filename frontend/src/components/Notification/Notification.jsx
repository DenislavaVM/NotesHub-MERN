import React, { useEffect } from "react";
import { LuCheck } from "react-icons/lu";
import { MdDeleteOutline, MdErrorOutline } from "react-icons/md";
import "./Notification.css";

const Notification = ({ isShown, message, type, onClose }) => {
  const getIcon = () => {
    if (type === "delete") return <MdDeleteOutline className="icon-delete-color" />;
    if (type === "error") return <MdErrorOutline className="icon-error-color" />;
    return <LuCheck className="icon-success-color" />;
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onClose();
    }, 3000);
    return () => {
      clearTimeout(timeoutId);
    }
  }, [onClose]);

  return (
    <div className={`notification-container ${isShown ? "notification-visible" : "notification-hidden"}`}>
      <div className={`notification-content notification-${type}`}>
        <div className="notification-body">
          <div className={`notification-icon icon-${type}`}>
            {getIcon()}
          </div>
          <p className="notification-message">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default Notification;