import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./editProfile.scss";

const EditProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    skills: "",
    education: "",
    experience: "",
    others: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get(`http://localhost:8800/API_B/profile/${id}`, {
          withCredentials: true,
        });

        const data = res.data;

        setFormData({
          name: data.name || "",
          description: data.description || "",
          facebook: data.facebook || data.socialLinks?.facebook || "",
          instagram: data.instagram || data.socialLinks?.instagram || "",
          twitter: data.twitter || data.socialLinks?.twitter || "",
          linkedin: data.linkedin || data.socialLinks?.linkedin || "",
          skills: data.skills || "",
          education: data.education || "",
          experience: data.experience || "",
          others: data.others || "",
        });
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        setError("Failed to load profile info.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUserData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:8800/API_B/profile/update/${id}`,
        {
          name: formData.name,
          description: formData.description,
          socialLinks: {
            facebook: formData.facebook,
            instagram: formData.instagram,
            twitter: formData.twitter,
            linkedin: formData.linkedin,
          },
          skills: formData.skills,
          education: formData.education,
          experience: formData.experience,
          others: formData.others,
        },
        { withCredentials: true }
      );
      navigate(`/profile/${id}`);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile.");
    }
  };

  const handleCancel = () => {
    navigate(`/profile/${id}`);
  };

  if (loading) return <div>Loading profile data...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="edit-profile-container">
      <div className="top-bar">
        <button className="back-btn" onClick={handleCancel}>
          &lt; Back To Profile
        </button>
      </div>

      <h1>Edit Profile</h1>

      <form className="edit-profile-form" onSubmit={handleSave}>
        <label>
          Name <span className="required">*</span>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </label>

        <label>
          About / Description
          <textarea name="description" value={formData.description} onChange={handleChange} rows={4} />
        </label>

        <label>
          Skills
          <textarea name="skills" value={formData.skills} onChange={handleChange} rows={3} placeholder="e.g. React, Node.js, SQL..." />
        </label>

        <label>
          Education
          <textarea name="education" value={formData.education} onChange={handleChange} rows={3} placeholder="e.g. B.Tech in CSE from XYZ University..." />
        </label>

        <label>
          Professional Experience
          <textarea name="experience" value={formData.experience} onChange={handleChange} rows={3} placeholder="e.g. Intern at ABC Corp, Project Lead at XYZ..." />
        </label>

        <label>
          Others
          <textarea name="others" value={formData.others} onChange={handleChange} rows={3} placeholder="Certifications, volunteering, etc." />
        </label>

        <label>
          Facebook URL
          <input type="url" name="facebook" value={formData.facebook} onChange={handleChange} placeholder="https://facebook.com/username" />
        </label>

        <label>
          Instagram URL
          <input type="url" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="https://instagram.com/username" />
        </label>

        <label>
          Twitter URL
          <input type="url" name="twitter" value={formData.twitter} onChange={handleChange} placeholder="https://twitter.com/username" />
        </label>

        <label>
          LinkedIn URL
          <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/username" />
        </label>

        <div className="form-buttons">
          <button type="button" className="cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" className="save-btn">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
