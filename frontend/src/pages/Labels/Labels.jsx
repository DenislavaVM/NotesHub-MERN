import React, { useEffect, useState } from "react";
import { TextField, Button, IconButton, List, ListItem, ListItemText } from "@mui/material";
import { MdDelete, MdEdit } from "react-icons/md";
import { useLabels } from "../../hooks/useLabels";
import "./Labels.css";

const Labels = () => {
    const { labels, createLabel, updateLabel, deleteLabel, error, } = useLabels();
    const [newLabel, setNewLabel] = useState("");
    const [editLabelId, setEditLabelId] = useState(null);
    const [editLabelName, setEditLabelName] = useState("");
    const [formError, setFormError] = useState("");

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
        </div>
    );
};

export default Labels;