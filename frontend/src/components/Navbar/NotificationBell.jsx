import React, { useState } from "react";
import { MdNotifications, MdNotificationsNone } from "react-icons/md";
import { useNotifications } from "../../context/NotificationProvider";
import moment from "moment";
import "./NotificationBell.css";

const NotificationBell = () => {
    const { notifications, unreadCount, markAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = () => {
        setIsOpen(prev => !prev);
    };

    const handleRead = (id) => {
        markAsRead(id);
    };

    return (
        <div className="notification-bell">
            <button onClick={handleToggle} className="notification-button">
                {unreadCount > 0 ? <MdNotifications /> : <MdNotificationsNone />}
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>

            {isOpen && (
                <div className="notifications-dropdown">
                    <div className="dropdown-header">Notifications</div>
                    <div className="dropdown-list">
                        {notifications.length > 0 ? (
                            notifications.map(notif => (
                                <div key={notif._id} className={`notification-item ${!notif.isRead ? "unread" : ""}`} onClick={() => !notif.isRead && handleRead(notif._id)}>
                                    <p className="notification-message">{notif.message}</p>
                                    <span className="notification-time">{moment(notif.createdAt).fromNow()}</span>
                                </div>
                            ))
                        ) : (
                            <div className="no-notifications">No notifications yet.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;