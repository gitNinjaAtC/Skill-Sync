import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FacebookTwoTone as FacebookTwoToneIcon,
  LinkedIn as LinkedInIcon,
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
} from "@mui/icons-material";

import SkillsSection from "./SkillsSection";
import EducationSection from "./EducationSection";
import ProfessionalExperienceSection from "./ProfessionalExperienceSection";
import OthersSection from "./OthersSection";

const ProfileInfo = ({ userId }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("skills");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get(`http://localhost:8800/API_B/profile/${userId}`, {
          withCredentials: true,
        });
        setUserData(res.data);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load profile info.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchUserData();
  }, [userId]);

  const handleEditClick = () => navigate(`/edit-profile/${userId}`);

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div className="error">{error}</div>;

  const {
    name = "No Name Provided",
    description = "",
    skills = "",
    education = "",
    experience = "",
    others = "",
    socialLinks = {},
    facebook,
    instagram,
    twitter,
    linkedin,
  } = userData;

  const finalLinks = {
    facebook: facebook || socialLinks.facebook,
    instagram: instagram || socialLinks.instagram,
    twitter: twitter || socialLinks.twitter,
    linkedin: linkedin || socialLinks.linkedin,
  };

  return (
    <div className="profile-info">
      {/* 1st Division: Header only */}
      <div className="profile-info-header">
        <div className="profile-header">
          <h2>{name}</h2>
          <button className="edit-btn" onClick={handleEditClick}>Edit Profile</button>
        </div>
      </div>

      {/* 2nd Division: Everything below header */}
      <div className="profile-info-body">
        <p className="description">{description}</p>

        <div className="profile-actions">
          <div className="social-links">
            {finalLinks.facebook && (
              <a href={finalLinks.facebook} target="_blank" rel="noopener noreferrer" title="Facebook">
                <FacebookTwoToneIcon fontSize="large" />
              </a>
            )}
            {finalLinks.instagram && (
              <a href={finalLinks.instagram} target="_blank" rel="noopener noreferrer" title="Instagram">
                <InstagramIcon fontSize="large" />
              </a>
            )}
            {finalLinks.twitter && (
              <a href={finalLinks.twitter} target="_blank" rel="noopener noreferrer" title="Twitter">
                <TwitterIcon fontSize="large" />
              </a>
            )}
            {finalLinks.linkedin && (
              <a href={finalLinks.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn">
                <LinkedInIcon fontSize="large" />
              </a>
            )}
          </div>
          <button className="message-btn">Message</button>
        </div>

        <div className="profile-tabs">
          <button className={activeTab === "skills" ? "active" : ""} onClick={() => setActiveTab("skills")}>Skills</button>
          <button className={activeTab === "education" ? "active" : ""} onClick={() => setActiveTab("education")}>Education</button>
          <button className={activeTab === "experience" ? "active" : ""} onClick={() => setActiveTab("experience")}>Professional Experience</button>
          <button className={activeTab === "others" ? "active" : ""} onClick={() => setActiveTab("others")}>Others</button>
        </div>

        <div className="tab-content">
          {activeTab === "skills" && <SkillsSection skills={skills} />}
          {activeTab === "education" && <EducationSection education={education} />}
          {activeTab === "experience" && <ProfessionalExperienceSection experience={experience} />}
          {activeTab === "others" && <OthersSection others={others} />}
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;
