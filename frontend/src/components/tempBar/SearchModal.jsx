import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { MdSearch, MdClose, MdClear } from "react-icons/md";
import { useSearch } from "../../context/SearchContext";
import "./SearchModal.css";

const SearchModal = ({ isOpen, onClose }) => {
    const { searchQuery, handleSearch, handleClearSearch } = useSearch();
    const [currentQuery, setCurrentQuery] = useState("");

    useEffect(() => {
        if (isOpen) {
            setCurrentQuery(searchQuery);
        }
    }, [isOpen, searchQuery]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        handleSearch(currentQuery);
        onClose();
    };

    const clearAndClose = () => {
        handleClearSearch();
        setCurrentQuery("");
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            overlayClassName="search-modal-overlay"
            className="search-modal-content"
        >
            <div className="search-modal-header">
                <h3 className="search-modal-title">Search Notes</h3>
                <button className="icon-btn" onClick={onClose} aria-label="Close search">
                    <MdClose size={24} />
                </button>
            </div>
            <form onSubmit={handleSearchSubmit} className="search-modal-form">
                <div className="search-input-wrapper">
                    <MdSearch className="search-input-icon" />
                    <input
                        type="text"
                        placeholder="Search by title or content..."
                        value={currentQuery}
                        onChange={(e) => setCurrentQuery(e.target.value)}
                        className="search-input-field"
                        autoFocus
                    />
                </div>
                <div className="search-modal-actions">
                    <button type="button" className="btn-secondary" onClick={clearAndClose}>
                        <MdClear />
                        Clear
                    </button>
                    <button type="submit" className="btn-primary">
                        <MdSearch />
                        Search
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default SearchModal;