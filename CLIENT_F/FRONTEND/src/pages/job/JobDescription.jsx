import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./JobDescription.scss";

const JobDescription = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await axios.get(`http://localhost:8800/API_B/jobs/${id}`);
        setJob(response.data);
      } catch (error) {
        console.error("Error fetching job details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!job) return <div>Job not found</div>;

  return (
    <div className="job-details-layout">
      {/* Main content */}
      <div className="job-details-page">
        <button className="back-button" onClick={() => navigate(-1)}>← Back</button>

        <div className="job-header">
          <img
            src={job.logo_path || "https://i.imgur.com/BWk34ei.png"}
            alt="Company Logo"
            className="job-logo"
          />
          <div>
            <h1>{job.job_title}</h1>
            <p className="company-name">{job.organisation_name}</p>
          </div>
          {job.created_at && (
            <span className="job-tag green">
              <time dateTime={job.created_at}>
                {new Date(job.created_at).toDateString()}
              </time>
            </span>
          )}
        </div>

        <div className="job-info">
          {job.employment_type && (
            <div><strong>Employment Type:</strong> {job.employment_type}</div>
          )}
          {job.location && (
            <div><strong>Location:</strong> {job.location}</div>
          )}
          <div><strong>CTC:</strong> ₹{job.cost_to_company || "0.0"}</div>
          <div><strong>Fixed:</strong> ₹{job.fixed_gross || "0.0"}</div>
          {job.remote_working && (
            <div><strong>Remote Working:</strong> {job.remote_working}</div>
          )}
        </div>

        {job.skills_required && (
          <div className="section">
            <h3>Required Skill(s)</h3>
            <div className="tags">
              {job.skills_required.split(",").map(skill => (
                <span key={skill.trim()} className="tag">{skill.trim()}</span>
              ))}
            </div>
          </div>
        )}

        {job.job_description && (
          <div className="section">
            <h3>Description</h3>
            <p>{job.job_description}</p>
          </div>
        )}

        {job.selection_process && (
          <div className="section">
            <h3>Selection Process</h3>
            <ul>
              {job.selection_process.split(",").map((step, i) => (
                <li key={i}>{step.trim()}</li>
              ))}
            </ul>
          </div>
        )}

        {job.other_benefits && (
          <div className="section">
            <h3>Other Benefits</h3>
            <p>{job.other_benefits}</p>
          </div>
        )}

        {job.bond_details && (
          <div className="section">
            <h3>Bond Details</h3>
            <p>{job.bond_details}</p>
          </div>
        )}

        <div className="section">
          <h3>Posted By</h3>
          <p>{job.posted_by || "Not specified"}</p>
        </div>
      </div>

      {/* Sidebar */}
      <div className="sidebar">
        <div className="card">
          <h4>REGISTRATION SCHEDULE</h4>
          <p><strong>Opens:</strong><br />
            {job.registration_start_date
              ? new Date(job.registration_start_date).toLocaleString()
              : "Not specified"}
          </p>
          <p><strong>Closes:</strong><br />
            {job.registration_end_date
              ? new Date(job.registration_end_date).toLocaleString()
              : "Not specified"}
          </p>
        </div>

        {job.offer_letter_path && (
          <div className="card">
            <h4>OFFER LETTER</h4>
            <a href={job.offer_letter_path} target="_blank" rel="noreferrer">View Document</a>
          </div>
        )}

        {job.letter_of_intent_path && (
          <div className="card">
            <h4>LETTER OF INTENT</h4>
            <a href={job.letter_of_intent_path} target="_blank" rel="noreferrer">View Document</a>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDescription;
