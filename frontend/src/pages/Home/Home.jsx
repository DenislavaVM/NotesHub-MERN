import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import NoteCard from "../../components/Cards/NoteCard";
import { MdAdd } from "react-icons/md";
import "./Home.css";
import AddEditNotes from "./AddEditNotes";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import apiClient from "../../utils/apiClient";
import Notification from "../../components/Notification/Notification";
import EmptyCard from "../../components/EmptyCard/EmptyCard";
import AddNotesImg from "../../assets/images/add-notes.svg";
import NoDataImg from "../../assets/images/no-data.svg";

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

  const [allNotes, setAllNotes] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [isSearch, setIsSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tags, setTags] = useState([]);
  const [sortBy, setSortBy] = useState("");
  const navigate = useNavigate();

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
      const response = await apiClient.get("/get-user");
      if (response.data && response.data.user) {
        setUserInfo(response.data.user);
      }
    } catch (error) {
      if (error.response.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    }
  };

  const getAllNotes = async () => {
    try {
      const response = await apiClient.get("/get-all-notes", {
        params: {
          searchQuery,
          tags: tags.join(","),
          sortBy
        },
      });

      if (response.data && response.data.notes) {
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.log("An unexpected error occurred. Please try again.");
    }
  };

  const handleSearch = (query) => {
    setIsSearch(true);
    setSearchQuery(query);
  };

  const handleDelete = async (data) => {
    const noteId = data._id;
    try {
      const response = await apiClient.delete("/delete-note/" + noteId);

      if (response.data && !response.data.error) {
        showNotificationMessage("Note deleted successfully", "delete");
        getAllNotes();
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        console.log("An unexpected error occurred. Please try again.");
      }
    }
  };

  const handlePin = async (noteData) => {
    const noteId = noteData._id;
    try {
      const response = await apiClient.put("/update-note-pinned/" + noteId, {
        isPinned: !noteData.isPinned,
      });

      if (response.data && response.data.note) {
        showNotificationMessage("Note updated successfully");
        getAllNotes();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleClearSearch = () => {
    setIsSearch(false);
    setSearchQuery("");
    setTags([]);
    getAllNotes();
  };

  useEffect(() => {
    getAllNotes();
    getUserInfo();
    return () => { };
  }, [searchQuery, tags, sortBy]);

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
          className={`home-container ${allNotes.length === 0 ? "empty" : ""}`}
        >
          <div className={`note-grid ${allNotes.length === 0 ? "empty-grid" : ""}`}>
            {allNotes && allNotes.length > 0 ? (
              allNotes.map((note) => (
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
        </div>
      </div>

      <button
        className="add-button"
        onClick={() => {
          setOpenAddEditModal({ isShown: true, type: "add", data: null });
        }}
      >
        <MdAdd className="add-icon" />
      </button>

      <Modal
        isOpen={openAddEditModel.isShown}
        onRequestClose={() =>
          setOpenAddEditModal({ isShown: false, type: "", data: null })
        }
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
          },
        }}
        className="modal-content"
      >
        <AddEditNotes
          type={openAddEditModel.type}
          noteData={openAddEditModel.data}
          onClose={() => {
            setOpenAddEditModal({
              isShown: false,
              type: "add",
              data: null,
            });
          }}
          getAllNotes={getAllNotes}
          showNotificationMessage={showNotificationMessage}
        />
      </Modal>
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