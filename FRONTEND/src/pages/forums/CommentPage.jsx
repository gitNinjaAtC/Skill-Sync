import React, { useEffect, useState, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/authContext";
import "./comments.scss";

const CommentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  const [forum, setForum] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const forumRes = await axios.get(
        `https://skill-sync-backend-522o.onrender.com/API_B/forums/${id}`
      );
      setForum(forumRes.data);

      const commentsRes = await axios.get(
        `https://skill-sync-backend-522o.onrender.com/API_B/forums/${id}/comments`
      );
      setComments(commentsRes.data || []);
    } catch (err) {
      console.error("❌ Error loading forum/comments", err);
      setError("Failed to load discussion.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    if (!currentUser) return;

    try {
      const res = await axios.post(
        `https://skill-sync-backend-522o.onrender.com/API_B/forums/${id}/comments`,
        {
          text: newComment,
          userId: currentUser._id,
        }
      );

      setComments((prev) => [...prev, res.data]);
      setNewComment("");
    } catch (err) {
      console.error("❌ Error posting comment", err.response || err.message);
      setError("Failed to post comment.");
    }
  };

  return (
    <div className="comments-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ⬅ Back
      </button>

      {loading ? (
        <p>Loading forum and comments...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <>
          {forum && (
            <div className="forum-details">
              <h2>{forum.title}</h2>
              <p>{forum.description}</p>
              <span className="author">Posted by: {forum.created_by?.name}</span>
            </div>
          )}

          <div className="comments-section">
            <h3>💬 Comments</h3>

            {comments.length === 0 ? (
              <p className="no-comments">No comments yet.</p>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="comment">
                  <span className="comment-author">
                    {comment.created_by?.name || "Unknown"}
                  </span>
                  <p className="comment-text">{comment.text}</p>
                </div>
              ))
            )}

            {currentUser ? (
              <div className="add-comment">
                <textarea
                  placeholder="Write your comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button onClick={handleAddComment}>Post Comment</button>
              </div>
            ) : (
              <p className="error">Login to post a comment.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CommentPage;
