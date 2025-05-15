import { useRef, useState } from "react";

const CoverPhoto = ({ userId }) => {
  const [coverImage, setCoverImage] = useState(
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb"
  );
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleEditClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);

      const formData = new FormData();
      formData.append("cover", file); // Must match multer single('cover')

      try {
        const BACKEND_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";
        const response = await fetch(`${BACKEND_URL}/API_B/profile/cover/${userId}`, {
          method: "PUT",
          body: formData,
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        setCoverImage(data.path); // Update state with new path from backend

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
      <button
        className="edit-cover"
        onClick={handleEditClick}
        disabled={uploading}
        style={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}
      >
        {uploading ? "Uploading..." : "Edit Cover Photo"}
      </button>
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
