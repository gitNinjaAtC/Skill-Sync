import "./share.scss";
import Image from "../../assets/img.png";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/authContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import fallbackAvatar from "../../assets/profile.jpg";

const Share = () => {
  const { currentUser } = useContext(AuthContext);
  const [desc, setDesc] = useState("");
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleShare = async (e) => {
    e?.preventDefault?.();

    if (!currentUser) {
      setError("You must be logged in to share a post.");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    if (!desc.trim()) {
      setError("Please enter some content to share.");
      return;
    }

    try {
      const res = await axios.post(
        "https://skill-sync-backend-522o.onrender.com/API_B/posts",
        { desc },
        { withCredentials: true }
      );
      setSuccess(res.data.message);
      setError(null);
      setDesc("");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMessage =
        err.response?.status === 401
          ? "Session expired. Please log in again."
          : err.response?.data?.message || "Failed to share post. Please try again.";
      setError(errorMessage);
      setSuccess(null);
      if (err.response?.status === 401) {
        setTimeout(() => navigate("/login"), 2000);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleShare(e);
    } else if (e.key === "Escape") {
      setDesc("");
      setError(null);
      setSuccess(null);
    }
  };

  const resolvedProfilePic =
    currentUser?.profilePic && currentUser.profilePic.trim() !== ""
      ? currentUser.profilePic.startsWith("http")
        ? currentUser.profilePic
        : `https://skill-sync-backend-522o.onrender.com${currentUser.profilePic}`
      : fallbackAvatar;

  return (
    <div className="share">
      <div className="container">
        <div className="top">
          <img
            src={resolvedProfilePic}
            alt="User"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = fallbackAvatar;
            }}
          />
          <input
            type="text"
            placeholder={`What's on your mind ${currentUser?.name || "User"}?`}
            value={desc}
            onChange={(e) => {
              setDesc(e.target.value);
              setError(null);
              setSuccess(null);
            }}
            onKeyDown={handleKeyDown}
          />
        </div>
        <hr />
        <div className="bottom">
          <div className="left">
            <div className="item disabled">
              <img src={Image} alt="" />
              <span>Add Image (Coming Soon)</span>
            </div>
          </div>
          <div className="right">
            <button onClick={handleShare}>Share</button>
          </div>
        </div>
        {success && <p className="success">{success}</p>}
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
};

export default Share;
