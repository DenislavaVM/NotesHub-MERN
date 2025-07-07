import { useEffect } from "react";
import Modal from "react-modal";
import { MdAdd } from "react-icons/md";
import { Fab } from "@mui/material";

import NoDataImg from "../../assets/images/no-data.svg";
import AddNotesImg from "../../assets/images/add-notes.svg";

import { useNotesContext } from "../../context/NotesContext";
import { useSearch } from "../../context/SearchContext";
import { useAuth } from "../../hooks/useAuth";

import NoteCard from "../../components/Cards/NoteCard";
import AddEditNotes from "./AddEditNotes";
import EmptyCard from "../../components/EmptyCard/EmptyCard";
import NoteSkeleton from "../../components/Loaders/NoteSkeleton";
import ShareNoteModal from "../../components/modals/ShareNoteModal";

import "./Home.css";

Modal.setAppElement("#root");

const Home = () => {
  const {
    notes,
    loading: notesLoading,
    pagination,
    setCurrentPage,
    fetchNotes,
    openAddEditModal,
    setOpenAddEditModal,
    shareModalState,
    closeShareModal,
  } = useNotesContext();
  const { isSearching } = useSearch();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user, fetchNotes]);

  if (authLoading) {
    return <div className="loading-container">Loading session...</div>;
  }

  return (
    <>
      <div className="home-container">
        {notes.length > 0 ? (
          <div className="note-grid-container">
            {notesLoading
              ? Array.from({ length: 8 }).map((_, idx) => <NoteSkeleton key={idx} />)
              : notes.map((note) => (
                <NoteCard
                  key={note._id}
                  note={note}
                />
              ))
            }
          </div>
        ) : (
          <div className="empty-dashboard-container">
            {notesLoading ? (
              <p>Loading...</p>
            ) : (
              <EmptyCard
                imgSrc={isSearching ? NoDataImg : AddNotesImg}
                message={
                  isSearching
                    ? "Oops! No notes found matching your search."
                    : "Start creating your first note!"
                }
              />
            )}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="pagination-container">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`pagination-button ${pagination.currentPage === page ? "active" : ""}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>

      <Fab
        color="primary"
        aria-label="add"
        className="add-note-fab"
        onClick={() => setOpenAddEditModal({ isShown: true, type: "add", data: null })}
      >
        <MdAdd size={24} />
      </Fab>

      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() => setOpenAddEditModal({ isShown: false, type: "add", data: null })}
        overlayClassName="modal-overlay"
        className="modal-content"
      >
        <AddEditNotes
          type={openAddEditModal.type}
          noteData={openAddEditModal.data}
          onClose={() => {
            setOpenAddEditModal({ isShown: false, type: "add", data: null });
          }}
        />
      </Modal>

      {shareModalState.isShown && (
        <ShareNoteModal
          isOpen={shareModalState.isShown}
          noteId={shareModalState.noteId}
          onClose={closeShareModal}
          onShareSuccess={closeShareModal}
        />
      )}
    </>
  );
};

export default Home;