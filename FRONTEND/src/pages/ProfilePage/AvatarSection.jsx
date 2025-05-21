import { useRef, useState } from "react";
import cameraIcon from "../../assets/camera-icon.png"; // Adjust path if needed

const AvatarSection = () => {
  const [avatarSrc, setAvatarSrc] = useState("https://randomuser.me/api/portraits/men/75.jpg");
  const fileInputRef = useRef(null);

  const handleEditClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarSrc(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageError = () => {
    setAvatarSrc(""); // Clears image and leaves fallback styling
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
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default AvatarSection;
