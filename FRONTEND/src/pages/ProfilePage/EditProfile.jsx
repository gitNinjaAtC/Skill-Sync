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

  const [originalData, setOriginalData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get(
          `https://skill-sync-backend-522o.onrender.com/API_B/profile/${id}`,
          { withCredentials: true }
        );
        const data = res.data;
        const safeData = {
          name: data.name || "",
          description: data.description || "",
          facebook: data.facebook || data.socialLinks?.facebook || "",
          instagram: data.instagram || data.socialLinks?.instagram || "",
          twitter: data.twitter || data.socialLinks?.twitter || "",
          linkedin: data.linkedin || data.socialLinks?.linkedin || "",
          skills: Array.isArray(data.skills)
            ? data.skills.join(", ")
            : data.skills || "",
          education: data.education || "",
          experience: data.experience || "",
          others: data.others || "",
        };
        setFormData(safeData);
        setOriginalData(safeData);
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
    setSaving(true);
    setError(null);

    try {
      const isUnchanged = Object.keys(formData).every((key) => {
        const currentVal =
          typeof formData[key] === "string"
            ? formData[key].trim()
            : JSON.stringify(formData[key]);

        const originalVal =
          typeof originalData[key] === "string"
            ? originalData[key].trim()
            : JSON.stringify(originalData[key]);

        return currentVal === originalVal;
      });

      if (isUnchanged) {
        setSaving(false);
        return alert("No changes made.");
      }

      const payload = {
        name: String(formData.name || "").trim(),
        description: String(formData.description || "").trim(),
        skills: formData.skills
          ? formData.skills
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean)
          : [],
        education: String(formData.education || "").trim(),
        experience: String(formData.experience || "").trim(),
        others: String(formData.others || "").trim(),
        socialLinks: {
          facebook: String(formData.facebook || "").trim(),
          instagram: String(formData.instagram || "").trim(),
          twitter: String(formData.twitter || "").trim(),
          linkedin: String(formData.linkedin || "").trim(),
        },
      };

      await axios.put(
        `https://skill-sync-backend-522o.onrender.com/API_B/profile/update/${id}`,
        payload,
        { withCredentials: true }
      );

      navigate(`/profile/${id}`);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/profile/${id}`);
  };

  if (loading) return <div className="loading">Loading profile...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="edit-profile-container">
      <div className="top-bar">
        <button className="back-btn" onClick={handleCancel}>
          <span className="arrow-symbol">&larr;</span>
          <span className="go-back-text">Back To Profile</span>
        </button>
      </div>

      <h1>Edit Profile</h1>

      <form className="edit-profile-form" onSubmit={handleSave}>
        {[
          { label: "Name", name: "name", placeholder: "John Snow", required: true },
          {
            label: "About / Description",
            name: "description",
            placeholder: "e.g. I am a Student...",
            type: "textarea",
            required: true,
          },
          {
            label: "Skills",
            name: "skills",
            type: "textarea",
            placeholder: "e.g. React, Node.js, SQL...",
            required: true,
          },
          {
            label: "Education",
            name: "education",
            type: "textarea",
            placeholder: "e.g. B.Tech in CSE from XYZ University...",
          },
          {
            label: "Professional Experience",
            name: "experience",
            type: "textarea",
            placeholder: "e.g. Intern at ABC Corp...",
          },
          {
            label: "Others",
            name: "others",
            type: "textarea",
            placeholder: "Certifications, volunteering, etc.",
          },
          {
            label: "Facebook URL",
            name: "facebook",
            placeholder: "https://facebook.com/username",
          },
          {
            label: "Instagram URL",
            name: "instagram",
            placeholder: "https://instagram.com/username",
          },
          {
            label: "Twitter URL",
            name: "twitter",
            placeholder: "https://twitter.com/username",
          },
          {
            label: "LinkedIn URL",
            name: "linkedin",
            placeholder: "https://linkedin.com/in/username",
          },
        ].map(({ label, name, type, placeholder, required }) => (
          <label key={name}>
            <div className="label-with-required">
              {label}
              {required && <span className="required">*</span>}
            </div>
            {type === "textarea" ? (
              <textarea
                name={name}
                value={formData[name]}
                onChange={handleChange}
                placeholder={placeholder || ""}
                required={required}
                rows={3}
              />
            ) : (
              <input
                type="text"
                name={name}
                value={formData[name]}
                onChange={handleChange}
                placeholder={placeholder || ""}
                required={required}
              />
            )}
          </label>
        ))}

        <div className="form-buttons">
          <button type="button" className="cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={saving}>
            {saving ? (
              <>
                Saving
                <span className="spinner"></span>
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
