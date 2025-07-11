import React from "react";
import "./jobsDashboard.scss";

const JobsDashboard = () => {
  const jobStats = {
    newRequests: 3,
    approved: 2,
    rejected: 0,
    total: 5,
  };

  return (
    <div className="jobs-dashboard">
      <h2>Job Post Overview</h2>

      <div className="job-cards">

        <div className="job-card total">
          <i className="icon">📁</i>
          <h3>{jobStats.total}</h3>
          <p>Total Job Request</p>
          <button>View Details</button>
        </div>
        <div className="job-card new">
          <i className="icon">📄</i>
          <h3>{jobStats.newRequests}</h3>
          <p>New Job Post Request</p>
          <button>View Details</button>
        </div>

        <div className="job-card approved">
          <i className="icon">✅</i>
          <h3>{jobStats.approved}</h3>
          <p>Approved Job Post</p>
          <button>View Details</button>
        </div>

        <div className="job-card cancelled">
          <i className="icon">❌</i>
          <h3>{jobStats.rejected}</h3>
          <p>Cancelled / Rejected Job Post</p>
          <button>View Details</button>
        </div>

      </div>
    </div>
  );
};

export default JobsDashboard;
