// src/components/ProfileSkeleton.js
import React from "react";
import "./profileSkeleton.scss";

const ProfileSkeleton = () => {
  return (
    <div className="profile-info skeleton">
      <div className="profile-info-header">
        <div className="skeleton-line title"></div>
        <div className="skeleton-btn"></div>
      </div>
      <div className="profile-info-body">
        <div className="skeleton-line description"></div>
        <div className="skeleton-line description short"></div>

        <div className="social-links">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton-icon"></div>
          ))}
        </div>

        <div className="profile-tabs">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton-tab"></div>
          ))}
        </div>

        <div className="tab-content">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton-line"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
