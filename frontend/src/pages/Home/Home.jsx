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
      const response = await apiClient.get("/get-all-notes");

      if (response.data && response.data.notes) {
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.log("An unexpexted error accured. Please try again.");
    }
  }

  useEffect(() => {
    getAllNotes();
    getUserInfo();

    return () => {

    }
  }, [])

  return (
    <>
      <Navbar userInfo={userInfo} />

      <div className="home-container">
        <div className="note-grid">
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
                onDelete={() => handleDelete(note._id)}
                onPinNote={() => handlePin(note._id)}
              />
            ))
          ) : (
            <p>No notes available</p>
          )}
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
        onRequestClose={() => setOpenAddEditModal({ isShown: false, type: "", data: null })}
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
            setOpenAddEditModal({ isShown: false, type: "add", data: null })
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