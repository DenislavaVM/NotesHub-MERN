import React, { useEffect, useState } from "react";
import "./Labels.css";
import apiClient from "../../utils/apiClient";
import { TextField, Button, IconButton, List, ListItem, ListItemText } from "@mui/material";
import { MdDelete, MdEdit } from "react-icons/md";

const Labels = () => {
    const [labels, setLabels] = useState([]);
    const [newLabel, setNewLabel] = useState("");
    const [editLabelId, setEditLabelId] = useState(null);
    const [editLabelName, setEditLabelName] = useState("");
    const [error, setError] = useState("");

    const fetchLabels = async () => {
        try {
            const response = await apiClient.get("/labels");
            if (response.data && response.data.labels) {
                setLabels(response.data.labels);
            }
        } catch (err) {
            console.error("Failed to load labels", err);
        }
    };

    const createLabel = async () => {
        if (!newLabel.trim()) return;
        try {
            await apiClient.post("/labels", { name: newLabel });
            setNewLabel("");
            fetchLabels();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create label");
        }
    };

    const updateLabel = async () => {
        if (!editLabelName.trim()) return;
        try {
            await apiClient.put(`/labels/${editLabelId}`, { name: editLabelName });
            setEditLabelId(null);
            setEditLabelName("");
            fetchLabels();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update label");
        }
    };

    const deleteLabel = async (labelId) => {
        try {
            await apiClient.delete(`/labels/${labelId}`);
            fetchLabels();
        } catch (err) {
            console.error("Failed to delete label");
        }
    };

    useEffect(() => {
        fetchLabels();
    }, []);

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
                <Button variant="contained" onClick={createLabel}>Add</Button>
            </div>

            {error && <p className="error-message">{error}</p>}

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
                                <Button onClick={updateLabel}>Save</Button>
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