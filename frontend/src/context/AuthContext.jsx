import { createContext, useState, useEffect, useCallback, useMemo } from "react";
import apiClient, { setApiAccessToken } from "../utils/apiClient";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const login = useCallback((userData, token) => {
        setApiAccessToken(token);
        setUser(userData);
        navigate("/dashboard");
    }, [navigate]);

    const logout = useCallback(async (message) => {
        try {
            await apiClient.post("/auth/logout");
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error("Logout failed:", error);
            }
        } finally {
            setApiAccessToken(null);
            setUser(null);
            navigate("/login");
            toast.info(message || "You have been logged out");
        }
    }, [navigate]);

    useEffect(() => {
        const handleSessionExpired = () => {
            logout();
        };

        window.addEventListener("sessionExpired", handleSessionExpired);
        return () => {
            window.removeEventListener("sessionExpired", handleSessionExpired);
        };
    }, [logout]);

    useEffect(() => {
        const checkUserSession = async () => {
            const token = localStorage.getItem("accessToken");
            if (token) {
                setApiAccessToken(token);
            };

            try {
                const response = await apiClient.get("/users/get-user");
                if (response.data?.data?.user) {
                    setUser(response.data.data.user);
                }
            } catch (error) {
                if (import.meta.env.DEV) {
                    console.log("No active session found.");
                }
            } finally {
                setLoading(false);
            }
        };

        checkUserSession();
    }, []);


    const contextValue = useMemo(() => ({
        user,
        login,
        logout,
        loading
    }), [user, login, logout, loading]);

    return (
        <AuthContext.Provider value={contextValue}>
            {!loading && children}
        </AuthContext.Provider>
    );
};