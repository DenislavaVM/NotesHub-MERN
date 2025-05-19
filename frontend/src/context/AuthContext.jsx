import React, { createContext, useState, useEffect } from "react";
import apiClient from "../utils/apiClient";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    const fetchUser = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const response = await apiClient.get("/get-user", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data) {
                setUser(response.data.user);
            }
        } catch (err) {
            console.error("Auto-login failed", err);
            logout();
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
};