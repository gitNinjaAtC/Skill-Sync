import { useRef, useState, useEffect } from "react";
import defaultCover from "../../assets/cover.png";

const CoverPhoto = ({ userId, currentUserId }) => {
  const [coverImage, setCoverImage] = useState(defaultCover);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const BACKEND_URL =
    process.env.NODE_ENV === "production"
      ? process.env.REACT_APP_API_BASE_URL_PROD
      : process.env.REACT_APP_API_BASE_URL_LOCAL;

  useEffect(() => {
    const fetchCoverPhoto = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/API_B/profile/${userId}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.coverPhoto) {
          setCoverImage(`${data.coverPhoto}?t=${Date.now()}`);
        }
      } catch (error) {
        console.error("Failed to load cover photo", error);
      }
    };
    if (userId) fetchCoverPhoto();
  }, [userId, BACKEND_URL]);

  const handleEditClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);

      const formData = new FormData();
      formData.append("image", file);

      try {
        const response = await fetch(
          `${BACKEND_URL}/API_B/profile/cover/${userId}`,
          {
            method: "PUT",
            body: formData,
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Upload failed");
        }

        setCoverImage(`${data.url}?t=${Date.now()}`);
      } catch (error) {
        console.error("Error uploading cover photo:", error);
        alert("Failed to upload image. Please try again.");
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <div className="cover-photo" style={{ position: "relative" }}>
      {coverImage && (
        <img
          src={coverImage}
          alt="Cover"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}

      {/* Only show edit button if it's the current user's own profile */}
      {currentUserId === userId && (
        <button
          className="edit-cover"
          onClick={handleEditClick}
          disabled={uploading}
          style={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}
        >
          {uploading ? "Uploading..." : "Edit Cover Photo"}
        </button>
      )}

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

export default CoverPhoto;
