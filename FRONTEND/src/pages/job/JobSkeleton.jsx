// JobSkeleton.jsx
import React from "react";
import "./JobSkeleton.scss";

const JobSkeleton = () => {
  return (
    <div className="job-card skeleton">
      <div className="job-card-header">
        <div className="skeleton-logo shimmer"></div>
        <div className="skeleton-title-company">
          <div className="skeleton-title shimmer"></div>
          <div className="skeleton-company shimmer"></div>
        </div>
        <div className="skeleton-date shimmer"></div>
      </div>
      <div className="job-tags">
        <div className="skeleton-tag shimmer"></div>
        <div className="skeleton-tag shimmer"></div>
        <div className="skeleton-tag shimmer"></div>
      </div>
      <div className="job-details">
        {[...Array(4)].map((_, idx) => (
          <div key={idx}>
            <div className="skeleton-line shimmer"></div>
            <div className="skeleton-line-short shimmer"></div>
          </div>
        ))}
      </div>
      <div className="view-details">
        <div className="skeleton-button shimmer"></div>
      </div>
    </div>
  );
};

export default JobSkeleton;
