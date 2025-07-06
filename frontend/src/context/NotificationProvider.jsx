import React, { useState, useEffect, useCallback, createContext, useContext } from "react";
import apiClient from "../utils/apiClient";
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "./SocketContext";

export const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { user } = useAuth();
    const socket = useSocket();

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            const response = await apiClient.get("/notifications");
            setNotifications(response.data.data || []);
            setUnreadCount(response.data.unreadCount || 0);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    }, [user]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    useEffect(() => {
        if (socket) {
            const handleNewNotification = () => {
                fetchNotifications();
            };
            socket.on("new_notification", handleNewNotification);
            return () => {
                socket.off("new_notification", handleNewNotification);
            };
        }
    }, [socket, fetchNotifications]);

    const markAsRead = async (notificationId) => {
        try {
            await apiClient.put(`/notifications/${notificationId}/read`);
            setNotifications(prev =>
                prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    };

    const value = {
        notifications,
        unreadCount,
        markAsRead,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};