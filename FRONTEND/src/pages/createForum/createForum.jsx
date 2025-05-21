import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext"; // Updated path
import axios from "axios";
import "./createForum.scss";

const CreateForum = () => {
  const { currentUser, loading: authLoading } = useContext(AuthContext);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleTagAdd = () => {
    if (newTag && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (indexToRemove) => {
    setTags(tags.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!title || !description) {
      setError("Title and description are required.");
      setLoading(false);
      return;
    }

    try {
      console.log("Creating forum:", { title, description, tags });
      const res = await axios.post(
        "http://localhost:8800/API_B/forums",
        { title, description, tags },
        { withCredentials: true }
      );
      console.log("Forum created:", res.data);
      setSuccess("Forum created successfully!");
      setTitle("");
      setDescription("");
      setTags([]);
      setTimeout(() => navigate("/forums"), 2000);
    } catch (err) {
      console.error("Error creating forum:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to create forum.");
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/forums");
  };

  const handleGoBack = () => {
    navigate("/forums");
  };

  if (authLoading) {
    return <div className="create-forum-container">Loading...</div>;
  }

  if (!currentUser) {
    return (
      <div className="create-forum-container">
        Please log in to create a forum.
      </div>
    );
  }

  if (!["Admin", "Alumni"].includes(currentUser.role)) {
    return (
      <div className="create-forum-container">
        Access denied: Admin or Alumni only.
      </div>
    );
  }

  return (
    <div className="create-forum-container">
      <div className="top-bar">
        <button className="back-btn" onClick={handleGoBack}>
          <span className="arrow-symbol">{"<"}</span>
          <span className="go-back-text">Go Back</span>
        </button>
      </div>
      <h1>Create a New Forum</h1>
      {success && <p className="success">{success}</p>}
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="forum-form">
        <label>
          <span className="label-with-required">
            Title <span className="required">*</span>
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your forum title here"
            required
            disabled={loading}
          />
        </label>

        <label>
          <span className="label-with-required">
            Description <span className="required">*</span>
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description"
            maxLength={6000}
            required
            disabled={loading}
          />
          <div className="char-count">{description.length}/6000 characters</div>
        </label>

        <label>
          Relevant Tags
          <div className="tag-input">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add tags related to this forum"
              disabled={loading}
            />
            <button type="button" onClick={handleTagAdd} disabled={loading}>
              Add
            </button>
          </div>
          <div className="tags-list">
            {tags.map((tag, idx) => (
              <span className="tag-chip" key={idx}>
                {tag}
                <button
                  className="remove-tag-btn"
                  type="button"
                  onClick={() => handleRemoveTag(idx)}
                  disabled={loading}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </label>

        <div className="form-buttons">
          <button
            type="button"
            className="cancel-btn"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Creating..." : "Create Forum"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateForum;
