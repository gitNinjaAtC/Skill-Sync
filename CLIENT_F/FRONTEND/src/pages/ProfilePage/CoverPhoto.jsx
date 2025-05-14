import { useRef, useState } from "react";

const CoverPhoto = () => {
  const [coverImage, setCoverImage] = useState("https://images.unsplash.com/photo-1506744038136-46273834b3fb");
  const fileInputRef = useRef(null);

  const handleEditClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="cover-photo">
      {coverImage ? <img src={coverImage} alt="Cover" /> : null}
      <button className="edit-cover" onClick={handleEditClick}>Edit Cover Photo</button>
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
