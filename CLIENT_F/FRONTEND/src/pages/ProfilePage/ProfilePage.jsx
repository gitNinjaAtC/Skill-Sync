import React from "react";
import { useParams } from "react-router-dom";
import "./ProfilePage.scss";
import CoverPhoto from "./CoverPhoto";
import AvatarSection from "./AvatarSection";
import ProfileInfo from "./ProfileInfo";
import AboutSection from "./AboutSection";
import SkillsSection from "./SkillsSection";
import EducationSection from "./EducationSection";
import ProfessionalExperienceSection from "./ProfessionalExperienceSection";
import OthersSection from "./OthersSection";

const ProfilePage = () => {
  const { id } = useParams();

  return (
    <div className="profile-page">
      <CoverPhoto />
      <div className="profile-main">
        <AvatarSection />
        <ProfileInfo userId={id} />
      </div>
      <div id="about"><AboutSection /></div>
      <div id="skills"><SkillsSection /></div>
      <div id="education"><EducationSection /></div>
      <div id="experience"><ProfessionalExperienceSection /></div>
      <div id="others"><OthersSection /></div>
    </div>
  );
};

export default ProfilePage;
