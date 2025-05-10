import React, { useState } from "react";
import { Link } from "react-router-dom";  // Import Link from react-router-dom
import "./jobs.scss";

const Jobs = () => {
  const [activeTab, setActiveTab] = useState("opportunities");

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="jobs-container">
      <div className="header">
        <h1>
          <i className="icon">&#128188;</i> Jobs
        </h1>
        <nav>
          <span
            className={`tab ${activeTab === "opportunities" ? "active" : ""}`}
            onClick={() => handleTabClick("opportunities")}
          >
            Opportunities
          </span>
          <span
            className={`tab ${activeTab === "applications" ? "active" : ""}`}
            onClick={() => handleTabClick("applications")}
          >
            Applications
          </span>
          <span
            className={`tab ${activeTab === "offers" ? "active" : ""}`}
            onClick={() => handleTabClick("offers")}
          >
            Offers
          </span>
        </nav>
      </div>

      <div className="main-section">
        {activeTab === "opportunities" && (
          <div className="offers-section">
            <p>No opportunities available.</p>
          </div>
        )}
        {activeTab === "applications" && (
          <div className="offers-section">
            <p>You haven't applied to any jobs yet.</p>
          </div>
        )}
        {activeTab === "offers" && (
          <div className="offers-section">
            <p>There are no Job Offers.</p>
            <select className="dropdown">
              <option>Job Offers</option>
            </select>
          </div>
        )}

        <aside className="sidebar">
          <div className="offer-note">
            <div className="illustration"></div>
            <h4>Have you received any offer directly?</h4>
            <p>
              Please provide the offer details for the TPO's records and
              approval.
            </p>
            <Link to="/create-offer">
              <button className="create-offer">+ Create Offer</button>
            </Link> {/* Link to the CreateOffer page */}
          </div>          
        </aside>
      </div>
    </div>
  );
};

export default Jobs;
