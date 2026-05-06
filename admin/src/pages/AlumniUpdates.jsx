import React, { useState, useEffect } from "react";
import axios from "axios";
import "./alumniUpdates.scss";

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8800"
    : "https://skill-sync-backend-522o.onrender.com";

const AlumniUpdates = () => {
  const [searchName, setSearchName] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("Update");
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Edit state
  const [editingUpdate, setEditingUpdate] = useState(null); // holds the update being edited
  const [editNote, setEditNote] = useState("");
  const [editCategory, setEditCategory] = useState("Update");
  const [editLoading, setEditLoading] = useState(false);
  const [editMessage, setEditMessage] = useState("");

  const categories = [
    "Update",
    "Promotion",
    "New Job",
    "Joined Company",
    "Awarded",
    "Higher Studies",
    "Achievement",
  ];

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${API_BASE_URL}/API_B/admin/alumni-updates`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      setUpdates(res.data);
    } catch (err) {
      console.error("Error fetching updates:", err);
    }
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchName(value);

    if (value.length > 2) {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await axios.get(`${API_BASE_URL}/API_B/admin/students/search?name=${value}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
        setSearchResults(res.data);
      } catch (err) {
        console.error("Error searching students:", err);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setSearchResults([]);
    setSearchName(student.StudentName);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !note) {
      setMessage("Please select a student and write a note.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(
        `${API_BASE_URL}/API_B/admin/alumni-updates`,
        {
          studentId: selectedStudent._id,
          note,
          category,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      setMessage("Update created successfully!");
      setNote("");
      setCategory("Update");
      setSelectedStudent(null);
      setSearchName("");
      fetchUpdates();
    } catch (err) {
      console.error("Error creating update:", err);
      setMessage("Failed to create update.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this update?")) {
      try {
        const token = localStorage.getItem("adminToken");
        await axios.delete(`${API_BASE_URL}/API_B/admin/alumni-updates/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
        fetchUpdates();
      } catch (err) {
        console.error("Error deleting update:", err);
      }
    }
  };

  // Open the edit modal with the selected update's current values
  const handleEditOpen = (update) => {
    setEditingUpdate(update);
    setEditNote(update.note);
    setEditCategory(update.category || "Update");
    setEditMessage("");
  };

  // Close edit modal
  const handleEditClose = () => {
    setEditingUpdate(null);
    setEditNote("");
    setEditCategory("Update");
    setEditMessage("");
  };

  // Submit the edited update
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editNote.trim()) {
      setEditMessage("Note cannot be empty.");
      return;
    }

    setEditLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      await axios.put(
        `${API_BASE_URL}/API_B/admin/alumni-updates/${editingUpdate._id}`,
        { note: editNote, category: editCategory },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      setEditMessage("Update saved successfully!");
      fetchUpdates();
      setTimeout(() => handleEditClose(), 800);
    } catch (err) {
      console.error("Error updating:", err);
      setEditMessage("Failed to save update.");
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="alumni-updates-page">
      <h1>Alumni Notes & Updates</h1>

      <div className="form-container">
        <h2>Create New Update</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Search Alumni Name:</label>
            <input
              type="text"
              placeholder="Start typing name..."
              value={searchName}
              onChange={handleSearch}
              autoComplete="off"
            />
            {searchResults.length > 0 && (
              <ul className="search-dropdown">
                {searchResults.map((s) => (
                  <li key={s._id} onClick={() => handleSelectStudent(s)}>
                    {s.StudentName} ({s.batch} - {s.branch})
                  </li>
                ))}
              </ul>
            )}
          </div>

          {selectedStudent && (
            <div className="selected-info">
              Selected: <strong>{selectedStudent.StudentName}</strong> ({selectedStudent.EnrollmentNo})
            </div>
          )}

          <div className="form-group">
            <label>Update Category / Badge:</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="category-select"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Note / Update Details:</label>
            <textarea
              placeholder="Enter recent update or achievement of this alumni..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows="4"
            ></textarea>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Create Update"}
          </button>
        </form>
        {message && <p className="status-message">{message}</p>}
      </div>

      <div className="updates-list">
        <h2>Existing Alumni Updates</h2>
        {updates.length === 0 ? (
          <p>No updates found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Note</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {updates.map((update) => (
                <tr key={update._id}>
                  <td>{update.studentId?.StudentName}</td>
                  <td>
                    <span className={`category-badge ${update.category?.toLowerCase().replace(/\s+/g, "-")}`}>
                      {update.category}
                    </span>
                  </td>
                  <td className="note-cell">{update.note}</td>
                  <td>{new Date(update.createdAt).toLocaleDateString()}</td>
                  <td className="action-buttons">
                    <button className="edit-btn" onClick={() => handleEditOpen(update)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(update._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {editingUpdate && (
        <div className="modal-overlay" onClick={handleEditClose}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Update</h2>
              <button className="modal-close" onClick={handleEditClose}>&times;</button>
            </div>
            <p className="modal-student-name">
              Alumni: <strong>{editingUpdate.studentId?.StudentName}</strong>
            </p>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>Update Category / Badge:</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="category-select"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Note / Update Details:</label>
                <textarea
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  rows="4"
                  placeholder="Update note here..."
                ></textarea>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={handleEditClose}>Cancel</button>
                <button type="submit" disabled={editLoading}>
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
            {editMessage && <p className="status-message">{editMessage}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumniUpdates;