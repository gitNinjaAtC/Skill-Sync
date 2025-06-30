// src/components/post/PostSkeleton.jsx
import React from "react";
import "./postSkeleton.scss";

const PostSkeleton = () => {
  return (
    <div className="post skeleton">
      <div className="post-header">
        <div className="avatar-skeleton"></div>
        <div className="user-info-skeleton">
          <div className="skeleton-line name"></div>
          <div className="skeleton-line date"></div>
        </div>
      </div>
      <div className="skeleton-line content short"></div>
      <div className="skeleton-line content"></div>
      <div className="post-footer-skeleton">
        {[...Array(3)].map((_, i) => (
          <div className="footer-icon-skeleton" key={i}></div>
        ))}
      </div>
    </div>
  );
};

export default PostSkeleton;
