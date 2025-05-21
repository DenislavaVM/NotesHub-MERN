import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TextField, Button, IconButton, List, ListItem, ListItemText } from "@mui/material";
import { MdDelete, MdEdit } from "react-icons/md";
import { useLabels } from "../../hooks/useLabels";
import "./Labels.css";

const Labels = () => {
    const { labels, loading, createLabel, updateLabel, deleteLabel, error, } = useLabels();
    const [newLabel, setNewLabel] = useState("");
    const [editLabelId, setEditLabelId] = useState(null);
    const [editLabelName, setEditLabelName] = useState("");
    const [formError, setFormError] = useState("");
    const location = useLocation();
    const navigate = useNavigate();
    const cameFromAddEdit = location.state?.from === "addEditNote";
    const noteData = location.state?.noteData;
    const type = location.state?.type;

    const handleCreate = async () => {
        if (!newLabel.trim()) {
            setFormError("Label cannot be empty");
            return;
        };

        try {
            await createLabel(newLabel);
            setNewLabel("");
            setFormError("");
        } catch (err) {
            setFormError(err.response?.data?.message || "Failed to create label");
        }
    };

    const handleUpdate = async () => {
        if (!editLabelName.trim()) {
            setFormError("Label cannot be empty");
            return;
        };

        try {
            await updateLabel(editLabelId, editLabelName);
            setEditLabelId(null);
            setEditLabelName("");
            setFormError("");
        } catch (err) {
            setFormError(err.response?.data?.message || "Failed to update label");
        }
    };

    return (
        <div className="labels-page">
            <h2 className="labels-title">Manage Labels</h2>
            {cameFromAddEdit && (
                <Button
                    variant="outlined"
                    onClick={() => navigate("/dashboard", {
                        state: { openAddEditModal: true, noteData, type }
                    })}
                    style={{ marginBottom: "1rem" }}
                >
                    ← Back to Note
                </Button>
            )}

            <div className="label-input-row">
                <TextField
                    label="New Label"
                    variant="outlined"
                    size="small"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                />
                <Button variant="contained" onClick={handleCreate}>Add</Button>
            </div>

            {(formError || error) && (
                <p className="error-message">{formError || error}</p>
            )}

            {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="label-skeleton shimmer" />
                ))
            ) : (
                <List>
                    {labels.map((label) => (
                        <ListItem key={label._id} divider>
                            {editLabelId === label._id ? (
                                <>
                                    <TextField
                                        size="small"
                                        value={editLabelName}
                                        onChange={(e) => setEditLabelName(e.target.value)}
                                    />
                                    <Button onClick={handleUpdate}>Save</Button>
                                    <Button onClick={() => setEditLabelId(null)}>Cancel</Button>
                                </>
                            ) : (
                                <>
                                    <ListItemText primary={label.name} />
                                    <IconButton onClick={() => {
                                        setEditLabelId(label._id);
                                        setEditLabelName(label.name);
                                    }}>
                                        <MdEdit />
                                    </IconButton>
                                    <IconButton onClick={() => deleteLabel(label._id)}>
                                        <MdDelete />
                                    </IconButton>
                                </>
                            )}
                        </ListItem>
                    ))}
                </List>
            )}

        </div>
    );
};

export default Labels;