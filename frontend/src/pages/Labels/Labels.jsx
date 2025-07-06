import { useState } from "react";
import { Link } from "react-router-dom";
import { MdDelete, MdEdit, MdClose, MdCheck, MdArrowBack, MdAdd } from "react-icons/md";
import { useLabels } from "../../hooks/useLabels";
import LabelSkeleton from "../../components/Loaders/LabelSkeleton";
import "./Labels.css";

const Labels = () => {
    const { labels, loading, createLabel, updateLabel, deleteLabel, error } = useLabels();
    const [newLabel, setNewLabel] = useState("");
    const [editLabelId, setEditLabelId] = useState(null);
    const [editLabelName, setEditLabelName] = useState("");
    const [formError, setFormError] = useState("");

    const handleCreate = async () => {
        if (!newLabel.trim()) {
            setFormError("Label name cannot be empty");
            return;
        }
        try {
            await createLabel(newLabel);
            setNewLabel("");
            setFormError("");
        } catch (err) {
            setFormError(err.message || "Failed to create label");
        }
    };

    const handleUpdate = async () => {
        if (!editLabelName.trim()) return;
        try {
            await updateLabel(editLabelId, editLabelName);
            setEditLabelId(null);
            setEditLabelName("");
        } catch (err) {
            console.error("Failed to update label", err);
        }
    };

    const startEdit = (label) => {
        setEditLabelId(label._id);
        setEditLabelName(label.name);
    };

    const cancelEdit = () => {
        setEditLabelId(null);
        setEditLabelName("");
    };

    return (
        <div className="labels-page-container">
            <div className="labels-page">
                <Link to="/dashboard" className="back-to-notes-btn">
                    <MdArrowBack />
                    Back to Notes
                </Link>

                <h2 className="labels-title">Manage Labels</h2>

                <div className="form-group">
                    <div className="label-input-row">
                        <input
                            type="text"
                            className="input-box"
                            placeholder="Create a new label..."
                            value={newLabel}
                            onChange={(e) => {
                                setNewLabel(e.target.value);
                                if (formError) setFormError("");
                            }}
                            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                        />
                        <button
                            type="button"
                            className="btn-primary add-label-btn"
                            onClick={handleCreate}
                            aria-label="Add label"
                        >
                            <MdAdd size={24} />
                        </button>
                    </div>

                    {(formError || error) && (
                        <p className="error-message">{formError || error}</p>
                    )}
                </div>

                <div className="labels-list">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => <LabelSkeleton key={i} />)
                    ) : (
                        labels.map((label) => (
                            <div key={label._id} className="label-list-item">
                                {editLabelId === label._id ? (
                                    <>
                                        <input
                                            type="text"
                                            className="input-box inline-edit-input"
                                            value={editLabelName}
                                            onChange={(e) => setEditLabelName(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
                                            autoFocus
                                        />
                                        <div className="inline-edit-actions">
                                            <button className="icon-btn" onClick={handleUpdate}><MdCheck /></button>
                                            <button className="icon-btn" onClick={cancelEdit}><MdClose /></button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <span className="label-name">{label.name}</span>
                                        <div className="label-actions">
                                            <button className="icon-btn" onClick={() => startEdit(label)}><MdEdit /></button>
                                            <button className="icon-btn" onClick={() => deleteLabel(label._id)}><MdDelete /></button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Labels;