import { useContext, useEffect, useState } from "react";
import "./comments.scss";
import { AuthContext } from "../../context/authContext";
import axios from "axios";

const Comments = ({ postId }) => {
  const { currentUser, loading: authLoading } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState(null);

  // Fetch comments when postId or currentUser changes
  useEffect(() => {
    const fetchComments = async () => {
      if (!currentUser || !postId) return;

      try {
        console.log(`Fetching comments for postId=${postId}`);
        const res = await axios.get(
          `http://localhost:8800/API_B/comments/${postId}`,
          { withCredentials: true }
        );

        // MongoDB _id to id mapping for frontend consistency
        const normalizedComments = res.data.map((c) => ({
          ...c,
          id: c._id || c.id, // fallback if _id missing
        }));

        setComments(normalizedComments);
        setError(null);
      } catch (err) {
        console.error(
          "Failed to fetch comments:",
          err.response?.data || err.message
        );
        setError(err.response?.data?.message || "Failed to load comments.");
      }
    };

    fetchComments();
  }, [postId, currentUser]);

  // Handle sending a new comment
  const handleSend = async () => {
    if (!newComment.trim()) {
      setError("Comment cannot be empty.");
      return;
    }
    if (!currentUser) {
      setError("Please log in to comment.");
      return;
    }

    try {
      console.log(`Posting comment for postId=${postId}`);
      const res = await axios.post(
        "http://localhost:8800/API_B/comments",
        { postId, comment: newComment },
        { withCredentials: true }
      );

      // Add the new comment at the start with normalized id
      setComments((prev) => [
        {
          id: res.data.commentId,
          comment: newComment,
          userId: currentUser.id,
          name: currentUser.name,
          profilePic: currentUser.profilePic,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);

      setNewComment("");
      setError(null);
    } catch (err) {
      console.error(
        "Failed to post comment:",
        err.response?.data || err.message
      );
      setError(err.response?.data?.message || "Failed to post comment.");
    }
  };

  if (authLoading) {
    return <div className="comments">Loading...</div>;
  }

  return (
    <div className="comments">
      {error && <p className="error">{error}</p>}
      {currentUser && (
        <div className="write">
          <img src={currentUser.profilePic || "/default-avatar.png"} alt="" />
          <input
            type="text"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button onClick={handleSend}>Send</button>
        </div>
      )}
      {comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        comments.map((comment) => (
          <div className="comment" key={comment.id}>
            <img src={comment.profilePic || "/default-avatar.png"} alt="" />
            <div className="info">
              <span>{comment.name}</span>
              <p>{comment.comment}</p>
            </div>
            <span className="date">
              {new Date(comment.createdAt).toLocaleString()}
            </span>
          </div>
        ))
      )}
    </div>
  );
};

export default Comments;
