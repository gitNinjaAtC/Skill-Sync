import React, { useState } from "react";
import { useNavigate } from "react-router-dom";  // Import useNavigate from react-router-dom
import "./eventNav.scss";

const EventNav = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const navigate = useNavigate();  // Initialize useNavigate

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    navigate(`/events/${tab}`);  // Navigate based on the active tab
  };

  return (
    <div className="events-container">
      <div className="header">
        <h1>
          <i className="icon">&#128197;</i> Events
        </h1>
        <nav>
          <span
            className={`tab ${activeTab === "upcoming" ? "active" : ""}`}
            onClick={() => handleTabClick("upcoming")}
          >
            Upcoming Events
          </span>
          <span
            className={`tab ongoing-tab ${activeTab === "ongoing" ? "active" : ""}`}
            onClick={() => handleTabClick("ongoing")}
          >
            Ongoing Events {"(Closed)"}
          </span>
        </nav>
      </div>
    </div>
  );
};

export default EventNav;
