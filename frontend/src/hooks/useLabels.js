import { useState, useEffect } from "react";
import apiClient from "../utils/apiClient";

export const useLabels = () => {
    const [labels, setLabels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchLabels = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get("/labels");
            setLabels(response.data.labels || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch labels");
        } finally {
            setLoading(false);
        }
    };

    const createLabel = async (name) => {
        setError(null);
        try {
            await apiClient.post("/labels", { name });
            await fetchLabels();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create label");
            throw err;
        };
    };

    const updateLabel = async (labelId, name) => {
        setError(null);
        try {
            await apiClient.put(`/labels/${labelId}`, { name });
            await fetchLabels();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update label");
            throw err;
        };
    };

    const deleteLabel = async (labelId) => {
        await apiClient.delete(`/labels/${labelId}`);
        await fetchLabels();
    };

    useEffect(() => {
        fetchLabels();
    }, []);

    return {
        labels,
        loading,
        error,
        createLabel,
        updateLabel,
        deleteLabel,
        refetch: fetchLabels,
    };
};
