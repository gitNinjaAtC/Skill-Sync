import React from "react";
import "./jobs.scss";

const Jobs = () => {
  return (
    <div className="jobs-container">
      <div className="header">
        <h1>
          <i className="icon">&#128188;</i> Jobs
        </h1>
        <nav>
          <span className="tab">Opportunities</span>
          <span className="tab">Applications</span>
          <span className="tab active">Offers</span>
        </nav>
      </div>

      <div className="main-section">
        <div className="offers-section">
          <p>There are no Job Offers.</p>
          <select className="dropdown">
            <option>Job Offers</option>
          </select>
        </div>

        <aside className="sidebar">
          <div className="offer-note">
            <div className="illustration"></div>
            <h4>Have you received any offer directly?</h4>
            <p>
              Please provide the offer details for the TPOs records and
              approval.
            </p>
            <button className="create-offer">+ Create Offer</button>
          </div>

          <div className="stats-card">
            <div className="stat opportunity">
              <span className="title">OPPORTUNITY</span>
              <span className="value">0</span>
              <span className="desc">
                Opportunities you are / were eligible for
              </span>
            </div>
            <div className="stat application">
              <span className="title">APPLICATION</span>
              <span className="value">1</span>
              <span className="desc">
                Opportunities you have applied for
              </span>
            </div>
            <div className="stat offer">
              <span className="title">OFFER IN HAND</span>
              <span className="value">0</span>
              <span className="desc">
                Opportunities you have received an offer for
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Jobs;
