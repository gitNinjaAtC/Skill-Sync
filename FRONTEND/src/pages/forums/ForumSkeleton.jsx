// ForumSkeleton.jsx
import React from "react";
import "./ForumSkeleton.scss";

const ForumSkeleton = () => {
  return (
    <div className="forum-card skeleton">
      <div className="forum-header">
        <div className="skeleton-timestamp shimmer"></div>
        <div className="skeleton-button shimmer"></div>
      </div>
      <div className="skeleton-title shimmer"></div>
      <div className="skeleton-description shimmer"></div>
      <div className="skeleton-tags">
        {[...Array(3)].map((_, idx) => (
          <div key={idx} className="skeleton-tag shimmer"></div>
        ))}
      </div>
      <div className="skeleton-created shimmer"></div>
      <div className="skeleton-comments shimmer"></div>
    </div>
  );
};

export default ForumSkeleton;
