import React from "react";
import { useParams } from "react-router-dom";
import "./ProfilePage.scss";
import CoverPhoto from "./CoverPhoto";
import AvatarSection from "./AvatarSection";
import ProfileInfo from "./ProfileInfo";

const ProfilePage = () => {
  const { id } = useParams();

  return (
    <div className="profile-page">
      <CoverPhoto userId={id} />
      <div className="profile-main">
        <AvatarSection userId={id} />
        <ProfileInfo userId={id} />
      </div>
    </div>
  );
};

export default ProfilePage;
