import React from "react";
import { Users } from "lucide-react";
import "./sidebarSkeleton.scss";

const SidebarSkeleton = () => {
  const skeletonContacts = Array(8).fill(null);

  return (
    <aside className="sidebar-skeleton">
      {/* Header */}
      <div className="sidebar-header">
        <div className="header-top">
          <Users className="icon" />
          <div className="title-skeleton" />
        </div>
        <div className="header-bottom">
          <div className="dot-skeleton" />
          <div className="bar-skeleton" />
        </div>
      </div>

      {/* Contact List Skeleton */}
      <div className="contact-list">
        {skeletonContacts.map((_, idx) => (
          <div key={idx} className="contact-skeleton">
            <div className="avatar-skeleton" />
            <div className="info-skeleton">
              <div className="name-status">
                <div className="name-bar" />
                <div className="status-bar" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default SidebarSkeleton;
