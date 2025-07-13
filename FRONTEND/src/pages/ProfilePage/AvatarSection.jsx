import { useRef, useState, useEffect } from "react";
import axios from "axios";
import cameraIcon from "../../assets/camera-icon.png"; // Adjust path if needed
import profilePic from "../../assets/profile.jpg"; // Default fallback image

const AvatarSection = ({ userId }) => {
  const [avatarSrc, setAvatarSrc] = useState(profilePic); // Default to local image
  const fileInputRef = useRef(null);

  // Fetch profile picture on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/API_B/profile/${userId}`
        );
        const profilePicPath = response.data.profilePic;
        if (profilePicPath) {
          // Prepend the server URL to the profilePic path
          setAvatarSrc(`http://localhost:3000${profilePicPath}`);
        } else {
          setAvatarSrc(profilePic); // Fallback to default image
        }
      } catch (error) {
        console.error("Error fetching profile picture:", error);
        setAvatarSrc(profilePic); // Fallback to default image on error
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const handleEditClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Preview the image locally before upload
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarSrc(reader.result); // Temporarily show the selected image
      };
      reader.readAsDataURL(file);

      // Upload the image to the server
      const formData = new FormData();
      formData.append("profilePic", file);

      try {
        const response = await axios.put(
          `http://localhost:3000/API_B/profile/profilePic/${userId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        // Update avatarSrc with the server-returned path
        setAvatarSrc(`http://localhost:3000${response.data.path}`);
      } catch (error) {
        console.error("Error uploading profile picture:", error);
        // Revert to default or previous image on error
        setAvatarSrc(profilePic);
      }
    }
  };

  const handleImageError = () => {
    setAvatarSrc(profilePic); // Fallback to default image if the server image fails to load
  };

  return (
    <div className="avatar-section">
      <div className="avatar-wrapper">
        <img
          className="avatar"
          src={avatarSrc}
          alt="Avatar"
          onError={handleImageError}
        />
        <button className="edit-avatar" onClick={handleEditClick}>
          <img src={cameraIcon} alt="Edit" className="edit-icon" />
        </button>
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
