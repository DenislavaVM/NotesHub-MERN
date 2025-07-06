import React, { useState, useEffect, useCallback, createContext } from "react";
import apiClient from "../utils/apiClient";
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "./SocketContext";

export const LabelsContext = createContext();

export const LabelsProvider = ({ children }) => {
    const [labels, setLabels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user, loading: authLoading } = useAuth();
    const socket = useSocket();

    const fetchLabels = useCallback(async () => {
        if (authLoading || !user) return;

        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get("/labels");
            setLabels(response.data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch labels");
        } finally {
            setLoading(false);
        }
    }, [authLoading, user]);

    useEffect(() => {
        fetchLabels();
    }, [fetchLabels]);

    useEffect(() => {
        if (socket) {
            socket.on("labels:updated", fetchLabels);
            return () => {
                socket.off("labels:updated", fetchLabels);
            };
        }
    }, [socket, fetchLabels]);

    const createLabel = async (name) => {
        setError(null);
        try {
            const response = await apiClient.post("/labels", { name });
            const createdLabel = response.data.data;
            setLabels((prev) => [...prev, createdLabel]);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create label");
            throw err;
        }
    };

    const updateLabel = async (labelId, name) => {
        setError(null);
        try {
            await apiClient.put(`/labels/${labelId}`, { name });
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update label");
            throw err;
        }
    };

    const deleteLabel = async (labelId) => {
        try {
            await apiClient.delete(`/labels/${labelId}`);
            setLabels((prev) => prev.filter(label => label._id !== labelId));
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete label");
            throw err;
        }
    };

    const value = {
        labels,
        loading,
        error,
        createLabel,
        updateLabel,
        deleteLabel,
        refetch: fetchLabels,
    };

    return (
        <LabelsContext.Provider value={value}>
            {children}
        </LabelsContext.Provider>
    );
};