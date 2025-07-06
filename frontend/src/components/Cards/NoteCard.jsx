import { useContext } from "react";
import { useSwipeable } from "react-swipeable";
import {
    MdOutlinePushPin,
    MdCreate,
    MdDelete,
    MdShare,
    MdPeople
} from "react-icons/md";
import { AuthContext } from "../../context/AuthContext";
import { useNotesContext } from "../../context/NotesContext";
import moment from "moment";
import "./NoteCard.css";

const NoteCard = ({ note }) => {
    const {
        _id: noteId,
        title,
        createdAt: date,
        content,
        labels = [],
        isPinned,
        userId,
        color,
    } = note;

    const { deleteNote, togglePinNote, handleEditNote, handleShareNote } = useNotesContext();
    const { user: currentUser } = useContext(AuthContext);
    const isShared = userId && currentUser && userId._id !== currentUser._id;

    const onEdit = () => handleEditNote(note);

    const swipeHandlers = useSwipeable({
        onSwipedLeft: () => !isShared && deleteNote(noteId),
        onSwipedRight: onEdit,
        preventDefaultTouchmoveEvent: true,
        trackTouch: true,
    });

    return (
        <div
            {...swipeHandlers}
            className="note-card"
            onClick={onEdit}
            style={{ backgroundColor: color }}
        >
            <div className="note-card-header">
                <div>
                    <div className="title-container">
                        <h6 className="note-title">{title}</h6>
                        {isShared && (
                            <span className="shared-indicator" title={`Shared by ${userId?.firstName || "another user"}`}>
                                <MdPeople />
                            </span>
                        )}
                    </div>
                    <span className="note-date">{moment(date).format("Do MMM YYYY")}</span>
                </div>
                <button className={`icon-btn pin-btn ${isPinned ? "pinned" : ""}`} onClick={(e) => { e.stopPropagation(); togglePinNote(noteId, isPinned); }}>
                    <MdOutlinePushPin />
                </button>
            </div>

            <p className="note-content-text">
                {content?.substring(0, 300) + (content?.length > 300 ? "..." : "")}
            </p>

            <div className="note-footer">
                <div className="note-labels">
                    {labels.map((label) => (
                        <span key={label._id || label} className="label-chip">
                            {label.name || label}
                        </span>
                    ))}
                </div>
                <div className="note-actions">
                    <button className={`icon-btn ${isShared ? "disabled" : ""}`} onClick={(e) => { e.stopPropagation(); if (!isShared) handleShareNote(noteId); }} title={isShared ? "Only the owner can share this note" : "Share Note"}>
                        <MdShare />
                    </button>
                    <button className="icon-btn" onClick={(e) => { e.stopPropagation(); onEdit(); }} title="Edit Note">
                        <MdCreate />
                    </button>
                    <button className={`icon-btn ${isShared ? "disabled" : ""}`} onClick={(e) => { e.stopPropagation(); if (!isShared) deleteNote(noteId); }} title={isShared ? "Only the owner can delete this note" : "Delete Note"}>
                        <MdDelete />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NoteCard;