import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./comments.scss";
import { AuthContext } from "../../context/authContext";
import axios from "axios";
import defaultAvatar from "../../assets/avatar.png";

const Comments = ({ postId }) => {
  const { currentUser, loading: authLoading } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState(null);
  const [loadingComments, setLoadingComments] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      if (!currentUser) return;

      setLoadingComments(true);

      try {
        const res = await axios.get(
          `https://skill-sync-backend-522o.onrender.com/API_B/comments/${postId}`,
          { withCredentials: true }
        );
        setComments(res.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch comments:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Failed to load comments.");
      } finally {
        setLoadingComments(false);
      }
    };

    fetchComments();
  }, [postId, currentUser]);

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
      const res = await axios.post(
        "https://skill-sync-backend-522o.onrender.com/API_B/comments",
        { postId, comment: newComment },
        { withCredentials: true }
      );

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
      console.error("Failed to post comment:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to post comment.");
    }
  };

  const getProfilePicUrl = (pic) => {
    if (!pic || pic.trim() === "") return defaultAvatar;
    return pic.startsWith("http")
      ? pic
      : `https://skill-sync-backend-522o.onrender.com${pic}`;
  };

  if (authLoading) {
    return <div className="comments">Loading...</div>;
  }

  return (
    <div className="comments">
      {error && <p className="error">{error}</p>}

      {currentUser && (
        <div className="write">
          <img
            src={getProfilePicUrl(currentUser.profilePic)}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultAvatar;
            }}
            alt="Profile"
          />
          <input
            type="text"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button onClick={handleSend}>Send</button>
        </div>
      )}

      {loadingComments ? (
        <p className="loading">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        comments.map((comment) => {
          const userId = comment.userId?._id || comment.userId;
          const username = comment.name || comment.userId?.name || "User";
          const profilePic = getProfilePicUrl(comment.profilePic || comment.userId?.profilePic);

          return (
            <div className="comment" key={comment.id}>
              <Link to={`/profile/${userId}`}>
                <img
                  src={profilePic}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultAvatar;
                  }}
                  alt="Comment user"
                />
              </Link>
              <div className="info">
                <Link to={`/profile/${userId}`} className="username-link">
                  {username}
                </Link>
                <p>{comment.comment}</p>
              </div>
              <span className="date">
                {new Date(comment.createdAt).toLocaleString()}
              </span>
            </div>
          );
        })
      )}
    </div>
  );
};

export default Comments;
