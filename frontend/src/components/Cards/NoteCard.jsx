import React, { useState } from "react";
import {
    MdOutlinePushPin,
    MdCreate,
    MdDelete,
    MdShare
} from "react-icons/md";
import moment from "moment";
import ShareNoteModal from "../modals/ShareNoteModal";
import "./NoteCard.css";

const NoteCard = ({
    title,
    date,
    content,
    tags,
    isPinned,
    reminder,
    onEdit,
    onDelete,
    onPinNote,
    noteId
}) => {
    const [showShareModal, setShowShareModal] = useState(false);
    const formattedTags = typeof tags === "string" ? tags.split(",") : tags;

    return (
        <>
            <div className="note-card">
                <div className="note-card-header">
                    <div>
                        <h6 className="note-title">{title}</h6>
                        <span className="note-date">{moment(date).format("Do MMM YYYY")}</span>
                    </div>

                    <MdOutlinePushPin
                        className={`icon-btn ${isPinned ? "pinned" : "unpinned"}`}
                        onClick={onPinNote}
                        title={isPinned ? "Unpin Note" : "Pin Note"}
                    />
                </div>

                <p className="note-content">
                    {content && content.length > 60 ? content.slice(0, 60) + "..." : content}
                </p>

                <div className="note-footer">
                    {reminder && (
                        <div className="note-reminder">
                            Reminder: {moment(reminder).format("Do MMM YYYY, h:mm A")}
                        </div>
                    )}
                    <div className="note-tags">
                        {(Array.isArray(formattedTags) ? formattedTags : []).map((item, index) => (
                            <span key={index}>#{item}</span>
                        ))}
                    </div>
                    <div className="note-actions">
                        <MdShare
                            className="icon-btn"
                            onClick={() => setShowShareModal(true)}
                            title="Share Note"
                        />
                        <MdCreate
                            className="icon-btn edit-btn"
                            onClick={onEdit}
                            title="Edit Note"
                        />
                        <MdDelete
                            className="icon-btn delete-btn"
                            onClick={onDelete}
                            title="Delete Note"
                        />
                    </div>
                </div>
            </div>

            {showShareModal && (
                <ShareNoteModal
                    isOpen={showShareModal}
                    onClose={() => setShowShareModal(false)}
                    noteId={noteId}
                    onShareSuccess={() => setShowShareModal(false)}
                />
            )}
        </>
    );
};

export default NoteCard;