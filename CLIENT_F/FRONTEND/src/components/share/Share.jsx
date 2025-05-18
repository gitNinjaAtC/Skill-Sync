import "./share.scss";
import Image from "../../assets/img.png";
import Map from "../../assets/map.png";
import Friend from "../../assets/tag.png";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/authContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Share = () => {
  const { currentUser } = useContext(AuthContext);
  const [desc, setDesc] = useState("");
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleShare = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      setError("You must be logged in to share a post.");
      console.log("No currentUser, redirecting to login");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    if (!desc.trim()) {
      setError("Please enter some content to share.");
      return;
    }

    try {
      console.log("Sending POST /API_B/posts with desc:", desc);
      console.log("Current user:", currentUser);
      const res = await axios.post(
        "http://localhost:8800/API_B/posts",
        { desc },
        { withCredentials: true }
      );
      console.log("Post response:", res.data);
      setSuccess("Post sent for admin approval!");
      setError(null);
      setDesc(""); // Clear input
      setTimeout(() => setSuccess(null), 3000); // Clear success message
    } catch (err) {
      console.error("Post error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      const errorMessage =
        err.response?.status === 401
          ? "Session expired. Please log in again."
          : err.response?.data?.message ||
            "Failed to share post. Please try again.";
      setError(errorMessage);
      setSuccess(null);
      if (err.response?.status === 401) {
        console.log("401 error, redirecting to login");
        setTimeout(() => navigate("/login"), 2000);
      }
    }
  };

  return (
    <div className="share">
      <div className="container">
        <div className="top">
          <img src={currentUser?.profilePic || "/default-avatar.png"} alt="" />
          <input
            type="text"
            placeholder={`What's on your mind ${currentUser?.name || "User"}?`}
            value={desc}
            onChange={(e) => {
              setDesc(e.target.value);
              setError(null);
              setSuccess(null);
            }}
          />
        </div>
        <hr />
        <div className="bottom">
          <div className="left">
            <div className="item disabled">
              <img src={Image} alt="" />
              <span>Add Image (Coming Soon)</span>
            </div>
            <div className="item disabled">
              <img src={Map} alt="" />
              <span>Add Place (Coming Soon)</span>
            </div>
            <div className="item disabled">
              <img src={Friend} alt="" />
              <span>Tag Friends (Coming Soon)</span>
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
