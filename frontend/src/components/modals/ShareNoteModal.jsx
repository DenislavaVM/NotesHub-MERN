import React, { useState } from "react";
import Modal from "react-modal";
import { toast } from "react-toastify";
import apiClient from "../../utils/apiClient";
import "./ShareNoteModal.css";

const ShareNoteModal = ({ isOpen, onClose, noteId, onShareSuccess }) => {
    const [emails, setEmails] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateEmails = (emailsArray) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalids = emailsArray.filter((email) => !emailRegex.test(email));
        return invalids;
    };

    const handleShare = async () => {
        const emailList = emails.split(",").map((email) => email.trim()).filter(Boolean);
        if (!emailList.length) {
            toast.error("Please enter at least one email address");
            return;
        };

        const invalidEmails = validateEmails(emailList);
        if (invalidEmails.length > 0) {
            toast.error(`Invalid email(s): ${invalidEmails.join(", ")}`);
            return;
        };

        setIsSubmitting(true);

        try {
            const response = await apiClient.put(`/share-note/${noteId}`, {
                emails: emailList,
            });
            if (response.data && !response.data.error) {
                toast.success("Note shared successfully!");
                setEmails("");
                onShareSuccess?.();
            };
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to share note");
        } finally {
            setIsSubmitting(false);
        };
    };

    const handleClose = () => {
        setEmails("");
        toast.info("Sharing cancelled");
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onRequestClose={handleClose} className="share-modal" overlayClassName="overlay">
            <h3>Share Note</h3>
            <p>Enter email addresses (comma-separated):</p>
            <input
                type="text"
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                placeholder="e.g. alice@example.com, bob@example.com"
                className="email-input"
            />
            <div className="modal-actions">
                <button
                    onClick={handleShare}
                    className="btn-primary"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Sharing..." : "Share"}
                </button>
                <button onClick={onClose} className="btn-secondary">Cancel</button>
            </div>
        </Modal>
    );
};

export default ShareNoteModal;