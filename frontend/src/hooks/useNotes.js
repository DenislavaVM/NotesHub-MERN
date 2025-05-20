import { useState } from "react";
import { useError } from "../hooks/useError";
import apiClient from "../utils/apiClient";

export const useNotes = () => {
    const { showError } = useError();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchNotes = async ({ searchQuery = "", tags = [], sortBy = "" } = {}) => {
        setLoading(true);

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
            showError(err.response?.data?.message || "Failed to fetch notes");
        } finally {
            setLoading(false);
        }
    };

    const deleteNote = async (noteId) => {
        try {
            await apiClient.delete(`/delete-note/${noteId}`);
            setNotes((prev) => prev.filter((n) => n._id !== noteId));
        } catch (err) {
            showError(err.response?.data?.message || "Delete failed");
            throw err;
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
            showError("Pin update failed");
            throw err;
        }
    };

    return {
        notes,
        loading,
        fetchNotes,
        deleteNote,
        togglePinNote,
        setNotes,
    };
};