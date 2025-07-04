import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import axios from "axios";
import Forum from "../../assets/forums.png";
import ForumSkeleton from "./ForumSkeleton";
import "./forums.scss";

const Forums = () => {
  const { currentUser, loading: authLoading } = useContext(AuthContext);
  const [forums, setForums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchForums = async () => {
      setLoading(true);
      try {
        console.log("Fetching forums...");
        const res = await axios.get("https://skill-sync-backend-522o.onrender.com/API_B/forums", {
          withCredentials: true,
        });
        console.log("Fetched forums:", res.data);
        setForums(res.data);
        setError(null);
      } catch (err) {
        console.error(
          "Error fetching forums:",
          err.response?.data || err.message
        );
        setError(err.response?.data?.message || "Failed to load forums.");
      } finally {
        setLoading(false);
      }
    };
    fetchForums();
  }, []);

  const handleCreateForum = () => {
    navigate("/create-forum");
  };

  const handleDeleteForum = async (forumId) => {
    if (!window.confirm("Are you sure you want to delete this forum?")) return;

    try {
      console.log("Deleting forum, id:", forumId);
      await axios.delete(`https://skill-sync-backend-522o.onrender.com/API_B/forums/${forumId}`, {
        withCredentials: true,
      });
      console.log("Forum deleted, id:", forumId);
      setForums(forums.filter((forum) => forum.id !== forumId));
      setError(null);
    } catch (err) {
      console.error("Error deleting forum:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to delete forum.");
    }
  };

  if (error) {
    return <div className="forum-container error">{error}</div>;
  }

  return (
    <div className="forum-container">
      {/* Always show this item */}
      <div className="item">
        <img src={Forum} alt="Forums" />
        <span>Forums</span>
      </div>

      {/* Show skeletons only during loading */}
      {authLoading || loading ? (
        <>
          {[...Array(3)].map((_, index) => (
            <ForumSkeleton key={index} />
          ))}
        </>
      ) : forums.length === 0 ? (
        <p>No forums available.</p>
      ) : (
        forums.map((post) => (
          <div key={post.id} className="forum-card">
            <div className="forum-header">
              <p className="timestamp">{post.createdAgo}</p>
              {currentUser && currentUser.id === post.created_by && (
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteForum(post.id)}
                >
                  Delete
                </button>
              )}
            </div>
            <h2 className="title">{post.title}</h2>
            <p className="description">{post.description}</p>

            <div className="tags">
              {post.tags.map((tag, idx) => (
                <span key={idx}>{tag}</span>
              ))}
            </div>

            <div className="interview-section">
              <p className="interview-name">
                Created by {post.created_by?.name}
              </p>
            </div>

            <div className="comment-count">💬 0 Comments so far</div>
          </div>
        ))
      )}

      {/* Always show Create Forum button if user is Admin or Alumni */}
      {currentUser && ["Admin", "Alumni"].includes(currentUser.role) && (
        <button
          className="create-forum-btn"
          onClick={handleCreateForum}
          disabled={authLoading || loading}
        >
          Create Forum
        </button>
      )}
    </div>
  );
};

export default Forums;
