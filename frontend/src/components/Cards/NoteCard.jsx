import React from "react";
import { MdOutlinePushPin, MdCreate, MdDelete } from "react-icons/md";
import "./NoteCard.css";

const NoteCard = ({
    title,
    date,
    content, 
    tags, 
    isPinned, 
    onEdit, 
    onDelete, 
    onPinNote
}) => {
  return (
    <div className="note-card">
        <div className="note-card-header">
            <div>
                <h6 className="note-title">{title}</h6>
                <span className="note-date">{date}</span>
            </div>

            <MdOutlinePushPin 
                className={`icon-btn ${isPinned ? "pinned" : "unpinned"}`} 
                onClick={onPinNote} 
            />
        </div>
        <p className="note-content">{content?.slice(0, 60)}</p>
        <div className="note-footer">
            <div className="note-tags">{tags}</div>
            <div className="note-actions">
                <MdCreate 
                    className="icon-btn edit-btn"
                    onClick={onEdit}
                />
                <MdDelete
                    className="icon-btn delete-btn"
                    onClick={onDelete}
                />
            </div>
        </div>
    </div>
  )
}

export default NoteCard;
