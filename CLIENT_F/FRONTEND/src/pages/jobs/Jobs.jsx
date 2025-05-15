import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./jobs.scss";

const Jobs = () => {
  const [activeTab, setActiveTab] = useState("opportunities");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activeTab === "opportunities") {
      const fetchJobs = async () => {
        setLoading(true);
        try {
          console.log("Fetching approved jobs...");
          const res = await axios.get("http://localhost:8800/API_B/jobs", {
            withCredentials: true,
          });
          console.log("Fetched jobs:", res.data);
          setJobs(res.data);
          setError(null);
        } catch (err) {
          console.error(
            "Error fetching jobs:",
            err.response?.data || err.message
          );
          setError(err.response?.data?.message || "Failed to load jobs.");
        } finally {
          setLoading(false);
        }
      };
      fetchJobs();
    }
  }, [activeTab]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="jobs-container">
      <div className="header">
        <h1>
          <i className="icon">💼</i> Jobs
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
            {loading ? (
              <p>Loading opportunities...</p>
            ) : error ? (
              <p className="error-message">{error}</p>
            ) : jobs.length === 0 ? (
              <p>No opportunities available.</p>
            ) : (
              <div className="job-list">
                {jobs.map((job) => (
                  <div key={job.job_id} className="job-card">
                    <h3>{job.job_title}</h3>
                    <p className="organisation">{job.organisation_name}</p>
                    <p className="ctc">
                      CTC: ₹{job.cost_to_company.toLocaleString()}
                    </p>
                    {job.location && (
                      <p className="location">Location: {job.location}</p>
                    )}
                    {job.remote_working && (
                      <p className="remote">Remote: {job.remote_working}</p>
                    )}
                    {job.offer_type && (
                      <p className="offer-type">Type: {job.offer_type}</p>
                    )}
                    <p className="posted-by">Posted by: {job.posted_by}</p>
                    <p className="created-at">
                      Posted: {new Date(job.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
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
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Jobs;
