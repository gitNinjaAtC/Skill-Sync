import "./share.scss";
import { useContext, useState, useRef } from "react";
import { AuthContext } from "../../context/authContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import fallbackAvatar from "../../assets/profile.jpg";
import imageCompression from "browser-image-compression";
import { Image, X } from "lucide-react";

const Share = () => {
  const { currentUser } = useContext(AuthContext);
  const [desc, setDesc] = useState("");
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // base64 preview
  const [imageFile, setImageFile] = useState(null);       // compressed base64 for upload
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setImageFile(reader.result); // base64 string to send to backend
        setError(null);
      };
      reader.readAsDataURL(compressedFile);
    } catch (err) {
      setError("Failed to process image. Please try again.");
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleShare = async (e) => {
    e?.preventDefault?.();

    if (!currentUser) {
      setError("You must be logged in to share a post.");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    if (!desc.trim() && !imageFile) {
      setError("Please add some text or an image to share.");
      return;
    }

    setIsPosting(true);

    try {
      const res = await axios.post(
        "https://skill-sync-backend-522o.onrender.com/API_B/posts",
        { desc, image: imageFile },
        { withCredentials: true }
      );
      setSuccess(res.data.message);
      setError(null);
      setDesc("");
      setImagePreview(null);
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
    } finally {
      setIsPosting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleShare(e);
    } else if (e.key === "Escape") {
      setDesc("");
      setImagePreview(null);
      setImageFile(null);
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
          <textarea
            placeholder={`What's on your mind ${currentUser?.name || "User"}?`}
            value={desc}
            onChange={(e) => {
              setDesc(e.target.value);
              setError(null);
              setSuccess(null);
            }}
            onKeyDown={handleKeyDown}
            rows={2}
          />
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="imagePreview">
            <img src={imagePreview} alt="Preview" />
            <button className="removeImage" onClick={removeImage} type="button">
              <X size={16} />
            </button>
          </div>
        )}

        <hr />

        <div className="bottom">
          <div className="left">
            <div
              className="item"
              onClick={() => fileInputRef.current?.click()}
              title="Add Photo"
            >
              <Image size={20} color={imagePreview ? "#5271ff" : "#555"} />
              <span>{imagePreview ? "Change Photo" : "Add Photo"}</span>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </div>
          </div>
          <div className="right">
            <button onClick={handleShare} disabled={isPosting}>
              {isPosting ? "Posting..." : "Share"}
            </button>
          </div>
        </div>

        {success && <p className="success">{success}</p>}
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
};

export default Share;
