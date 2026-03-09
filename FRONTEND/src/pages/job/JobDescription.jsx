import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { makeRequest, apiBaseUrl } from "../../axios";
import "./JobDescription.scss";
import { AuthContext } from "../../context/authContext";
import defaultLogo from "../../assets/default_logo.jpg"; // ✅ import default logo

const JobDescription = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState("");
  const [applicants, setApplicants] = useState([]);
  const [fetchingApplicants, setFetchingApplicants] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const isOwner = currentUser && job && String(currentUser.id) === String(job.user_id?._id || job.user_id);

  const fetchApplicants = async () => {
    if (!id) return;
    setFetchingApplicants(true);
    try {
      const response = await makeRequest.get(`/API_B/jobs/${id}/applications`);
      setApplicants(response.data || []);
    } catch (error) {
      console.error("Error fetching applicants:", error);
    } finally {
      setFetchingApplicants(false);
    }
  };

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await makeRequest.get(`/API_B/jobs/${id}`);
        setJob(response.data);
      } catch (error) {
        console.error("Error fetching job details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  useEffect(() => {
    if (isOwner) {
      fetchApplicants();
    }
  }, [isOwner, id]);

  useEffect(() => {
    const checkStatus = async () => {
      if (currentUser && currentUser.role === "student" && id) {
        try {
          const response = await makeRequest.get(`/API_B/jobs/${id}/my-status`);
          setApplied(response.data.applied);
        } catch (error) {
          console.error("Error checking application status:", error);
        }
      }
    };
    checkStatus();
  }, [currentUser, id]);

  const handleApply = async () => {
    if (!currentUser) return navigate("/login");
    setApplying(true);
    try {
      await makeRequest.post(`/API_B/jobs/${id}/apply`, {});
      setApplied(true);
      setMessage("Applied successfully!");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to apply.");
    } finally {
      setApplying(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    setUpdatingStatus(applicationId);
    try {
      await makeRequest.put(`/API_B/jobs/application/${applicationId}/status`, { status: newStatus });
      alert("Status updated successfully!");
      fetchApplicants();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    } finally {
      setUpdatingStatus(null);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!job) return <div>Job not found</div>;

  return (
    <div className="job-details-layout">
      {/* Header */}
      <header className="job-details-header">
        <h1>{job.organisation_name}</h1>
      </header>

      <div className="job-content">
        {/* Main content */}
        <div className="job-details-page">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Back
          </button>

          <div className="job-header">
            <img
              src={
                job.logo_path?.toLowerCase().includes("/uploads/")
                  ? `${apiBaseUrl}${job.logo_path}`
                  : job.logo_path || defaultLogo
              }
              alt="Company Logo"
              className="job-logo"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultLogo;
              }}
            />
            <div>
              <h1>{job.job_title}</h1>
              <p className="company-name">{job.organisation_name}</p>
            </div>
            <div className="job-header-meta">
              <span className={`status-pill ${job.approval_status?.toLowerCase()}`}>
                {job.approval_status}
              </span>
              {job.created_at && (
                <span className="job-tag green">
                  <time dateTime={job.created_at}>
                    {new Date(job.created_at).toDateString()}
                  </time>
                </span>
              )}
            </div>
          </div>

          <div className="job-info">
            {job.employment_type && (
              <div>
                <strong>Employment Type:</strong> {job.employment_type}
              </div>
            )}
            {job.location && (
              <div>
                <strong>Location:</strong> {job.location}
              </div>
            )}
            <div>
              <strong>CTC:</strong> ₹{job.cost_to_company || "0.0"}
            </div>
            <div>
              <strong>Fixed:</strong> ₹{job.fixed_gross || "0.0"}
            </div>
            {job.remote_working && (
              <div>
                <strong>Remote Working:</strong> {job.remote_working}
              </div>
            )}
          </div>

          {job.skills_required && (
            <div className="section">
              <h3>Required Skill(s)</h3>
              <div className="tags">
                {job.skills_required.split(",").map((skill) => (
                  <span key={skill.trim()} className="tag">
                    {skill.trim()}
                  </span>
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
          {currentUser?.role === "student" && (
            <div className="card application-card">
              {applied ? (
                <button className="apply-btn applied" disabled>
                  Applied
                </button>
              ) : (
                <button
                  className="apply-btn"
                  onClick={handleApply}
                  disabled={applying}
                >
                  {applying ? "Applying..." : "Apply Now"}
                </button>
              )}
              {message && <p className="apply-message">{message}</p>}
            </div>
          )}

          <div className="card">
            <h4>REGISTRATION SCHEDULE</h4>
            <p>
              <strong>Opens:</strong>
              <br />
              {job.registration_start_date
                ? new Date(job.registration_start_date).toLocaleString()
                : "Not specified"}
            </p>
            <p>
              <strong>Closes:</strong>
              <br />
              {job.registration_end_date
                ? new Date(job.registration_end_date).toLocaleString()
                : "Not specified"}
            </p>
          </div>

          {job.offer_letter_path && (
            <div className="card">
              <h4>OFFER LETTER</h4>
              <a
                href={
                  job.offer_letter_path?.toLowerCase().includes("/uploads/")
                    ? `${apiBaseUrl}${job.offer_letter_path}`
                    : job.offer_letter_path
                }
                target="_blank"
                rel="noreferrer"
              >
                View Document
              </a>
            </div>
          )}

          {job.letter_of_intent_path && (
            <div className="card">
              <h4>LETTER OF INTENT</h4>
              <a
                href={
                  job.letter_of_intent_path?.toLowerCase().includes("/uploads/")
                    ? `${apiBaseUrl}${job.letter_of_intent_path}`
                    : job.letter_of_intent_path
                }
                target="_blank"
                rel="noreferrer"
              >
                View Document
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDescription;
