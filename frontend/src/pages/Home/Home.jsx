import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdAdd } from "react-icons/md";
import { Fab, Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import NoDataImg from "../../assets/images/no-data.svg";

import apiClient from "../../utils/apiClient";
import { useAuth } from "../../hooks/useAuth";
import { useNotes } from "../../hooks/useNotes";

import Navbar from "../../components/Navbar/Navbar";
import NoteCard from "../../components/Cards/NoteCard";
import AddEditNotes from "./AddEditNotes";
import Notification from "../../components/Notification/Notification";
import EmptyCard from "../../components/EmptyCard/EmptyCard";
import AddNotesImg from "../../assets/images/add-notes.svg";

import "./Home.css";

const Home = () => {
  const [openAddEditModel, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  const [showNotificationMsg, setShowNotificationMsg] = useState({
    isShown: false,
    message: "",
    type: "add",
  });

  const { setUser } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [isSearch, setIsSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tags, setTags] = useState([]);
  const [sortBy, setSortBy] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const { notes, fetchNotes, deleteNote, togglePinNote, pagination } = useNotes();

  const handleEdit = (noteDetails) => {
    setOpenAddEditModal({ isShown: true, data: noteDetails, type: "edit" });
  };

  const showNotificationMessage = (message, type) => {
    setShowNotificationMsg({
      isShown: true,
      message: message,
      type: type,
    });
  };

  const handleCloseNotification = () => {
    setShowNotificationMsg({
      isShown: false,
      message: "",
    });
  };

  const getUserInfo = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      };

      const response = await apiClient.get("/get-user");
      if (response.data) {
        setUser(response.data);
        setUserInfo(response.data.user);
      };
    } catch (error) {
      if (error.response.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    }
  };

  const handleSearch = (query, tagsArray) => {
    setSearchQuery(query);
    setTags(tagsArray || []);
    setIsSearch(true);
    setCurrentPage(1);
  };

  const handleDelete = async (note) => {
    try {
      await deleteNote(note._id);
      showNotificationMessage("Note deleted successfully", "delete");
    } catch {
      console.log("An unexpected error occurred. Please try again.");
    }
  };

  const handlePin = async (note) => {
    try {
      await togglePinNote(note._id, !note.isPinned);
      showNotificationMessage("Note updated successfully", "update");
    } catch {
      console.log("An unexpected error occurred. Please try again.");
    }
  };

  const handleClearSearch = () => {
    setIsSearch(false);
    setSearchQuery("");
    setTags([]);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    getUserInfo();
  }, []);

  const tagKey = tags.join(",");
  useEffect(() => {
    fetchNotes({ searchQuery, tags, sortBy, page: currentPage });
  }, [searchQuery, tagKey, sortBy, currentPage]);

  return (
    <>
      <Navbar
        userInfo={userInfo}
        onSearchNote={handleSearch}
        handleClearSearch={handleClearSearch}
        setTags={setTags}
        setSortBy={setSortBy}
      />

      <div className="home-container">
        <div
          className={`home-container ${notes.length === 0 ? "empty" : ""}`}
        >
          <div className={`note-grid ${notes.length === 0 ? "empty-grid" : ""}`}>
            {notes.length > 0 ? (
              notes.map((note) => (
                <NoteCard
                  key={note._id}
                  title={note.title}
                  date={note.createdOn}
                  content={note.content}
                  tags={note.tags.join(", ")}
                  isPinned={note.isPinned}
                  onEdit={() => handleEdit(note)}
                  onDelete={() => handleDelete(note)}
                  onPinNote={() => handlePin(note)}
                  noteId={note._id}
                />
              ))
            ) : (
              <EmptyCard
                imgSrc={isSearch ? NoDataImg : AddNotesImg}
                message={
                  isSearch
                    ? "Oops! No notes found matching your search."
                    : "Start creating your first note! Click the 'Add' button to jot down your thoughts, ideas, and reminders. Let's get started!"
                }
              />
            )}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="pagination-container">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`pagination-button ${currentPage === page ? "active" : ""}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <Fab
        color="primary"
        aria-label="add"
        style={{ position: "fixed", bottom: "20px", right: "20px" }}
        onClick={() => setOpenAddEditModal({ isShown: true, type: "add", data: null })}
      >
        <MdAdd />
      </Fab>

      <Dialog open={openAddEditModel.isShown} onClose={() => setOpenAddEditModal({ isShown: false, type: "", data: null })}>
        <DialogTitle>Add/Edit Note</DialogTitle>
        <DialogContent>
          <AddEditNotes
            type={openAddEditModel.type}
            noteData={openAddEditModel.data}
            onClose={() => setOpenAddEditModal({ isShown: false, type: "add", data: null })}
            getAllNotes={() => fetchNotes({ searchQuery, tags, sortBy })}
            showNotificationMessage={showNotificationMessage}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddEditModal({ isShown: false, type: "", data: null })}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <Notification
        isShown={showNotificationMsg.isShown}
        message={showNotificationMsg.message}
        type={showNotificationMsg.type}
        onClose={handleCloseNotification}
      />
    </>
  );
};

export default Home;