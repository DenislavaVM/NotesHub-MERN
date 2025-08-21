import { createContext, useContext, useState, useCallback, useEffect, useReducer } from "react";
import { toast } from "react-toastify";
import apiClient from "../utils/apiClient";
import { useAuth } from "../hooks/useAuth";
import { useSearch } from "./SearchContext";

const NotesContext = createContext(null);

export const useNotesContext = () => {
    const context = useContext(NotesContext);
    if (!context) {
        throw new Error("useNotesContext must be used within a NotesProvider");
    }
    return context;
};

const shareModalReducer = (state, action) => {
    switch (action.type) {
        case "OPEN":
            return { isShown: true, noteId: action.payload.noteId };
        case "CLOSE":
            return { isShown: false, noteId: null };
        default:
            return state;
    }
};

export const NotesProvider = ({ children }) => {
    const { user, loading: authLoading } = useAuth();
    const { searchQuery, labels, sortBy } = useSearch();

    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ totalPages: 1, currentPage: 1, totalCount: 0 });
    const [currentPage, setCurrentPage] = useState(1);

    const [openAddEditModal, setOpenAddEditModal] = useState({
        isShown: false,
        type: "add",
        data: null,
    });

    const [shareModalState, dispatchShareModal] = useReducer(shareModalReducer, {
        isShown: false,
        noteId: null,
    });

    const handleEditNote = (noteDetails) => {
        setOpenAddEditModal({ isShown: true, data: noteDetails, type: "edit" });
    };

    const handleShareNote = (noteId) => {
        dispatchShareModal({ type: "OPEN", payload: { noteId } });
    };

    const closeShareModal = () => {
        dispatchShareModal({ type: "CLOSE" });
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, labels, sortBy]);

    const fetchNotes = useCallback(async () => {
        if (authLoading || !user) return;
        setLoading(true);
        try {
            const response = await apiClient.get("/notes/get-all-notes", {
                params: {
                    searchQuery,
                    tags: labels.join(","),
                    sortBy,
                    page: currentPage,
                },
            });
            const {
                notes: receivedNotes = [],
                currentPage: respPage = 1,
                totalPages: respTotalPages = 1,
                totalCount: respTotalCount = 0,
            } = response.data || {};

            setNotes(Array.isArray(receivedNotes) ? receivedNotes : []);
            setPagination({
                currentPage: respPage ?? 1,
                totalPages: respTotalPages ?? 1,
                totalCount: respTotalCount ?? 0,
            });
        } catch (err) {
            if (err.name !== "SessionExpiredError") {
                toast.error(err.response?.data?.error?.message || "Failed to fetch notes");
            };
        } finally {
            setLoading(false);
        }
    }, [searchQuery, labels, sortBy, currentPage, authLoading, user]);

    const addNote = async (payload) => {
        try {
            await apiClient.post("/notes/add-note", payload);
            toast.success("Note added successfully");
            setOpenAddEditModal({ isShown: false, type: "add", data: null });
            await fetchNotes();
        } catch (err) {
            toast.error(err.response?.data?.error?.message || "Failed to add note");
            throw err;
        }
    };

    const editNote = async (noteId, payload) => {
        setOpenAddEditModal({ isShown: false, type: "add", data: null });

        try {
            const response = await apiClient.put(`/notes/edit-note/${noteId}`, payload);
            const updatedNoteFromServer = response.data.data;
            setNotes(prevNotes =>
                prevNotes.map(note =>
                    note._id === noteId ? updatedNoteFromServer : note
                )
            );

            toast.success("Note updated successfully");
        } catch (err) {
            toast.error(err.response?.data?.error?.message || "Failed to update note");
            throw err;
        }
    };

    const deleteNote = async (noteId) => {
        const previousNotes = [...notes];
        setNotes(prevNotes => prevNotes.filter(note => note._id !== noteId));

        try {
            await apiClient.delete(`/notes/delete-note/${noteId}`);
            toast.success("Note deleted successfully");
        } catch (err) {
            setNotes(previousNotes);
            toast.error(err.response?.data?.error?.message || "Delete failed");
            throw err;
        }
    };

    const togglePinNote = async (noteId, isPinned) => {
        const previousNotes = [...notes];
        setNotes(prevNotes =>
            prevNotes
                .map(n => (n._id === noteId ? { ...n, isPinned: !isPinned } : n))
                .sort((a, b) => b.isPinned - a.isPinned)
        );
        try {
            await apiClient.put(`/notes/update-note-pinned/${noteId}`, { isPinned: !isPinned });
            toast.success(!isPinned ? "Note pinned successfully" : "Note unpinned successfully");
        } catch (err) {
            toast.error("Pin update failed");
            setNotes(previousNotes);
            throw err;
        }
    };

    const value = {
        notes,
        loading,
        pagination,
        currentPage,
        setCurrentPage,
        fetchNotes,
        addNote,
        editNote,
        deleteNote,
        togglePinNote,
        openAddEditModal,
        setOpenAddEditModal,
        shareModalState,
        handleEditNote,
        handleShareNote,
        closeShareModal,
    };

    return (
        <NotesContext.Provider value={value}>
            {children}
        </NotesContext.Provider>
    );
};