import { useCallback, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { MdClose } from "react-icons/md";
import { FormControl, Select, MenuItem, Checkbox, ListItemText, OutlinedInput } from "@mui/material";
import { useLabels } from "../../hooks/useLabels";
import { useNotesContext } from "../../context/NotesContext";
import { useSocket } from "../../context/SocketContext";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import "./AddEditNotes.css";

const EMPTY_CONTENT = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

const debounce = (fn, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};

const AddEditNotes = ({ type, noteData, onClose }) => {
  const { addNote, editNote } = useNotesContext();
  const { labels: availableLabels } = useLabels();
  const socket = useSocket();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: noteData?.title || "",
      content: noteData?.content || "",
      labels: noteData?.labels?.map(l => l.name) || [],
      color: noteData?.color || "#ffffff",
    },
  });

  const debouncedEmit = useCallback(
    debounce((field, value) => {
      if (socket && noteData?._id) {
        socket.emit("note:update", {
          noteId: noteData._id,
          field,
          value,
        });
      }
    }, 500),
    [socket, noteData]
  );

  const editor = useEditor({
    extensions: [StarterKit],
    content: noteData?.content || EMPTY_CONTENT,
    onUpdate: ({ editor }) => {
      const jsonContent = editor.getJSON();
      setValue("content", jsonContent, { shouldDirty: true });
      debouncedEmit("content", jsonContent);
    },
  });

  const selectedColor = watch("color");

  useEffect(() => {
    if (noteData) {
      setValue("title", noteData.title || "");
      setValue("labels", noteData.labels?.map((label) => label.name) || []);
      setValue("color", noteData.color || "#ffffff");
      const newContent = noteData.content || EMPTY_CONTENT;
      setValue("content", newContent);

      if (editor && JSON.stringify(editor.getJSON()) !== JSON.stringify(newContent)) {
        editor.commands.setContent(newContent, false);
      };
    };
  }, [noteData, setValue, editor]);

  useEffect(() => {
    if (type === "edit" && socket && noteData?._id) {
      socket.emit("note:join", noteData._id);
      const handleNoteUpdate = (data) => {
        const isTitleFocused = document.activeElement?.id === "note-title";
        const isEditorFocused = editor?.isFocused;

        if (data.field === "content" && editor && !isEditorFocused) {
          if (JSON.stringify(editor.getJSON()) !== JSON.stringify(data.value)) {
            editor.commands.setContent(data.value, false);
            setValue("content", data.value, { shouldDirty: true });
          };
        };

        if (data.field === "title" && !isTitleFocused) {
          setValue("title", data.value, { shouldDirty: true });
        };
      };
      socket.on("note:updated", handleNoteUpdate);

      return () => {
        socket.emit("note:leave", noteData._id);
        socket.off("note:updated", handleNoteUpdate);
      };
    }
  }, [socket, noteData, type, setValue, editor]);


  const onSubmit = async (data) => {
    try {
      if (type === "edit") {
        await editNote(noteData._id, data);
      } else {
        await addNote(data);
      }
      onClose();
    } catch (err) {
      const message = err.response?.data?.error?.message || `Failed to ${type} note.`;
      setError("serverError", { type: "manual", message });
    }
  };

  return (
    <div className="add-edit-notes-content" style={{ backgroundColor: selectedColor }}>
      <button className="close-btn icon-btn" onClick={onClose}>
        <MdClose />
      </button>
      <form onSubmit={handleSubmit(onSubmit)} className="add-edit-form">

        <div className="note-editor-header">
          <div className="input-group">
            <label className="input-label">TITLE</label>
            <Controller
              name="title"
              control={control}
              rules={{ required: "Please enter a title." }}
              render={({ field }) => (
                <input
                  id="note-title"
                  type="text"
                  className="input-field title-input"
                  placeholder="My Awesome Note"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    debouncedEmit("title", e.target.value);
                  }}
                />
              )}
            />
            {errors.title && <p className="error-message">{errors.title.message}</p>}
          </div>
        </div>

        <div className="note-editor-body">
          <div className="input-group content-group">
            <label className="input-label">CONTENT</label>
            <div className="tiptap-editor-wrapper">
              <EditorContent editor={editor} />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">COLOR</label>
            <Controller
              name="color"
              control={control}
              render={({ field }) => (
                <div className="color-palette">
                  {["#ffffff", "#fecaca", "#fef08a", "#bbf7d0", "#bfdbfe", "#fbcfe8"].map(
                    (color) => (
                      <div
                        key={color}
                        className={`color-swatch ${field.value === color ? "selected" : ""}`}
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          field.onChange(color);
                          debouncedEmit("color", color);
                        }}
                        aria-label={`Select color ${color}`}
                      />
                    )
                  )}
                </div>
              )}
            />
          </div>

          <div className="input-group">
            <label className="input-label">LABELS</label>
            <Controller
              name="labels"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth size="small">
                  <Select
                    labelId="labels-select-label"
                    multiple
                    {...field}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      debouncedEmit("labels", e.target.value);
                    }}
                    renderValue={(selected) => selected.join(", ") || "Select labels"}
                    input={<OutlinedInput />}
                    displayEmpty
                  >
                    {availableLabels.map((label) => (
                      <MenuItem key={label._id} value={label.name}>
                        <Checkbox checked={field.value.includes(label.name)} size="small" />
                        <ListItemText primary={label.name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </div>
        </div>

        {errors.serverError && (
          <p className="error-message">{errors.serverError.message}</p>
        )}

        <button type="submit" className="btn-primary">
          {type === "edit" ? "UPDATE" : "ADD"}
        </button>
      </form>
    </div>
  );
};

export default AddEditNotes;