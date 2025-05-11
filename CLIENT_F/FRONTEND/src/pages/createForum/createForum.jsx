import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./createForum.scss";

const CreateForum = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");

  const navigate = useNavigate();

  const handleTagAdd = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (indexToRemove) => {
    setTags(tags.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ title, description, tags });
  };

  const handleCancel = () => {
    navigate("/forums");
  };

  const handleGoBack = () => {
    navigate("/forums");
  };

  return (
    <div className="create-forum-container">
      <div className="top-bar">
        <button className="back-btn" onClick={handleGoBack}>
          <span className="arrow-symbol">{"<"}</span>
          <span className="go-back-text">Go Back</span>
        </button>
      </div>
      <h1>Create a new forum</h1>
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
            />
            <button type="button" onClick={handleTagAdd}>Add</button>
          </div>
          <div className="tags-list">
            {tags.map((tag, idx) => (
              <span className="tag-chip" key={idx}>
                {tag}
                <button
                  className="remove-tag-btn"
                  type="button"
                  onClick={() => handleRemoveTag(idx)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </label>

        <div className="form-buttons">
          <button type="button" className="cancel-btn" onClick={handleCancel}>Cancel</button>
          <button type="submit" className="submit-btn">Create Forum</button>
        </div>
      </form>
    </div>
  );
};

export default CreateForum;
