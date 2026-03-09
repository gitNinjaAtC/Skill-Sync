import React, { useState } from "react";

const EMPTY = {
  title: "",
  description: "",
  techStack: "",
  slots: 1,
  deadline: "",
};

const PostProjectModal = ({ onClose, onSubmit }) => {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const handle = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.deadline) {
      alert("Title, description and deadline are required.");
      return;
    }
    setSaving(true);
    await onSubmit({
      ...form,
      slots: Number(form.slots),
      techStack: form.techStack
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose}>×</button>
        <h2 className="modal__title">Post a New Project</h2>

        <div className="form-group">
          <label>Project Title *</label>
          <input
            name="title"
            placeholder="e.g. Alumni Directory Mobile App"
            value={form.title}
            onChange={handle}
          />
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            name="description"
            placeholder="What is the project about? What will students build or learn?"
            value={form.description}
            onChange={handle}
            rows={4}
          />
        </div>

        <div className="form-group">
          <label>Tech Stack</label>
          <input
            name="techStack"
            placeholder="React, Node.js, MongoDB  (comma separated)"
            value={form.techStack}
            onChange={handle}
          />
          <p className="form-group__hint">Separate technologies with commas</p>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Slots (team size) *</label>
            <input
              type="number"
              name="slots"
              min={1}
              max={20}
              value={form.slots}
              onChange={handle}
            />
          </div>
          <div className="form-group">
            <label>Application Deadline *</label>
            <input
              type="date"
              name="deadline"
              value={form.deadline}
              onChange={handle}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>

        <div className="form-actions">
          <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={handleSubmit} disabled={saving}>
            {saving ? "Posting…" : "Post Project"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostProjectModal;