import React, { useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import NoteCard from "../../components/Cards/NoteCard";
import { MdAdd } from "react-icons/md";
import "./Home.css";
import AddEditNotes from "./AddEditNotes";
import Modal from "react-modal";

const Home = () => {
  const [openAddEditModel, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  return (
    <>
      <Navbar />

      <div className="home-container">
        <div className="note-grid">
          <NoteCard 
            title="Meeting on 30th September" 
            date="20th Sep 2024" 
            content="Meeting on 30th September"
            tags="#meeting" 
            isPinned={true}
            onEdit={()=>{}}
            onDelete={()=>{}}
            onPinNote={()=>{}}
          /> 
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
        <AddEditNotes /> 
      </Modal>
    </>
  );
};

export default Home;