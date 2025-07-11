import React from "react";
import "./messageSkeleton.scss";

const MessageSkeleton = () => {
  const skeletonMessages = Array(6).fill(null);

  return (
    <div className="message-skeleton-container">
      {skeletonMessages.map((_, idx) => (
        <div
          key={idx}
          className={`chat-bubble-wrapper ${idx % 2 === 0 ? "left" : "right"}`}
        >
          <div className="avatar-skeleton">
            <div className="avatar-circle" />
          </div>

          <div className="header-skeleton" />

          <div className="bubble-skeleton">
            <div className="bubble-content" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageSkeleton;
