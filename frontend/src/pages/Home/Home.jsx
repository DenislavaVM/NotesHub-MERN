import React from "react";
import Navbar from "../../components/Navbar/Navbar";
import NoteCard from "../../components/Cards/NoteCard";
import { MdAdd } from "react-icons/md";
import "./Home.css";

const Home = () => {
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

      <button className="add-button" onClick={() => {}}>
        <MdAdd className="add-icon" />
      </button>
    </>
  );
};

export default Home;