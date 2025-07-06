import React, { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../hooks/useAuth";
import { getAccessToken } from "../utils/apiClient";

const SocketContext = createContext(null);

export const useSocket = () => {
    return useContext(SocketContext);
};

const URL = import.meta.env.VITE_API_URL || window.location.origin;

export const SocketProvider = ({ children }) => {
    const { user, logout } = useAuth();
    const socketRef = useRef(null);

    useEffect(() => {
        if (user) {
            const token = getAccessToken();
            socketRef.current = io(URL, {
                auth: {
                    token: token
                },
            });

            socketRef.current.on("connect_error", (err) => {
                console.error("Socket connection error:", err.message);
                if (err.message.includes("Authentication error")) {
                    logout();
                };
            });

        } else {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            };
        };

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            };
        };
    }, [user, logout]);

    return (
        <SocketContext.Provider value={socketRef.current}>
            {children}
        </SocketContext.Provider>
    );
};