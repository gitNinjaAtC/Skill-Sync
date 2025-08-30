import { useRef, useState, useContext, useEffect } from "react";
import cameraIcon from "../../assets/camera-icon.png";
import defaultProfilePic from "../../assets/profile.jpg";
import { AuthContext } from "../../context/authContext";
import axios from "axios";


const AvatarSection = ({ userId }) => {
  const [profilePic, setProfilePic] = useState(null);
  const [avatarSrc, setAvatarSrc] = useState(defaultProfilePic);
  const fileInputRef = useRef(null);
  const { currentUser } = useContext(AuthContext);
  const [uploading, setUploading] = useState(false);

  const BACKEND_URL =
    process.env.NODE_ENV === "production"
      ? process.env.REACT_APP_API_BASE_URL_PROD
      : process.env.REACT_APP_API_BASE_URL_LOCAL;

  useEffect(() => {
    const fetchProfilePic = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/API_B/profile/${userId}`, {
          credentials: "include",
        });
        const data = await res.json();

        if (data.profilePic && data.profilePic.trim() !== "") {
          setAvatarSrc(`${data.profilePic}?t=${Date.now()}`);
        } else {
          setAvatarSrc(defaultProfilePic);
        }
      } catch (err) {
        console.error("Failed to load profile picture", err);
        setAvatarSrc(defaultProfilePic);
      }
    };

    if (userId) fetchProfilePic();
  }, [userId, BACKEND_URL]);

  // Fetch profile picture on component mount
  // Fetch profile picture on component mount (with axios)
useEffect(() => {
  const fetchProfilePic = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/API_B/profile/${userId}`, {
        withCredentials: true,
      });

      const profilePicPath = res.data.profilePic;

      if (profilePicPath && profilePicPath.trim() !== "") {
        // If backend returns relative path, prepend backend URL
        const fullPath = profilePicPath.startsWith("http")
          ? profilePicPath
          : `${BACKEND_URL}${profilePicPath}`;

        setAvatarSrc(`${fullPath}?t=${Date.now()}`);
      } else {
        setAvatarSrc(defaultProfilePic);
      }
    } catch (err) {
      console.error("Failed to load profile picture", err);
      setAvatarSrc(defaultProfilePic);
    }
  };

  if (userId) fetchProfilePic();
}, [userId, BACKEND_URL]);


  const handleEditClick = () => {
    if (currentUser?._id === userId) {
      fileInputRef.current.click();
    } else {
      alert("You can only edit your own profile picture.");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploading(true);
      const response = await fetch(
        `${BACKEND_URL}/API_B/profile/profile-pic/${userId}`,
        {
          method: "PUT",
          body: formData,
          credentials: "include",
        }
      );

      const data = await response.json();
      if (response.ok) {
        setAvatarSrc(`${data.url}?t=${Date.now()}`);
      } else {
        alert("Upload failed: " + data.message);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error uploading profile picture.");
    } finally {
      setUploading(false);
    }
  };

  const handleImageError = () => {
    setAvatarSrc(defaultProfilePic);
  };

  return (
    <div className="avatar-section">
      <div className="avatar-wrapper">
        <img
          className="avatar"
          src={avatarSrc}
          alt="Avatar"
          onError={handleImageError}
          loading="lazy"
        />
        {currentUser?._id === userId && (
          <button
            className="edit-avatar"
            onClick={handleEditClick}
            disabled={uploading}
          >
            {uploading ? (
              <div className="loader" />
            ) : (
              <img src={cameraIcon} alt="Edit" className="edit-icon" />
            )}
          </button>
        )}
      </div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default AvatarSection;
