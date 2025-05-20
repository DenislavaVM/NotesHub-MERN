import { useState } from "react";
import apiClient from "../utils/apiClient";

export const useNotes = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchNotes = async ({ searchQuery = "", tags = [], sortBy = "" } = {}) => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiClient.get("/get-all-notes", {
                params: {
                    searchQuery,
                    tags: tags.join(","),
                    sortBy,
                },
            });
            setNotes(response.data.notes || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch notes");
        } finally {
            setLoading(false);
        }
    };

    const deleteNote = async (noteId) => {
        try {
            await apiClient.delete(`/delete-note/${noteId}`);
            setNotes((prev) => prev.filter((n) => n._id !== noteId));
        } catch (err) {
            throw new Error(err.response?.data?.message || "Delete failed");
        }
    };

    const togglePinNote = async (noteId, isPinned) => {
        try {
            const response = await apiClient.put(`/update-note-pinned/${noteId}`, { isPinned });
            const updatedNote = response.data.note;
            setNotes((prev) =>
                prev.map((note) => (note._id === noteId ? { ...note, ...updatedNote } : note))
            );
        } catch (err) {
            throw new Error("Pin update failed");
        }
    };

    return {
        notes,
        loading,
        error,
        fetchNotes,
        deleteNote,
        togglePinNote,
        setNotes,
    };
};
