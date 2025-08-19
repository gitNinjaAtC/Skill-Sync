import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Job.scss";
import { AuthContext } from "../../context/authContext";
import Jobs from "../../assets/Job.png";
import JobSkeleton from "./JobSkeleton.jsx";
import defaultLogo from "../../assets/default_logo.jpg"; // ✅ Import default logo

const popularTags = [
  "CSS",
  "Express.Js",
  "Html",
  "Python",
  "Javascript",
  "Mongodb",
  "Node.js",
  "React.js",
  "Teamwork",
  "Understanding Of Rest Apis And Git",
  "It / Computers - Software",
];

const Job = () => {
  const { currentUser, loading: authLoading } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [filterTag, setFilterTag] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("https://skill-sync-backend-522o.onrender.com/API_B/jobs")
      .then((response) => {
        const transformedJobs = (response.data || []).map((job) => ({
          id: job.job_id || job.id,
          title: job.job_title || "Untitled Job",
          company: job.organisation_name || "Unknown Company",
          tags: job.skills_required
            ? job.skills_required.split(",").map((tag) => tag.trim())
            : [],
          logo: job.logo_path?.startsWith("/Uploads")
            ? `https://skill-sync-backend-522o.onrender.com${job.logo_path}`
            : defaultLogo, // ✅ Use default logo if missing
          jobType: job.offer_type || "N/A",
          industry: job.employment_type || "N/A",
          ctc: job.cost_to_company || "N/A",
          location: job.location || "N/A",
          postedAgo: new Date(job.created_at).toLocaleDateString(),
          postedAgoISO: new Date(job.created_at).toISOString(),
        }));
        setJobs(transformedJobs);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load jobs.");
        setLoading(false);
      });
  }, []);

  const handleCreateJob = () => navigate("/jobs/CreateOffer");

  const filteredJobs = jobs.filter((job) =>
    filterTag === "All"
      ? true
      : (job.tags || []).some(
          (tag) => tag.toLowerCase() === filterTag.toLowerCase()
        )
  );

  return (
    <div className="forum-container">
      <div className="item">
        <img src={Jobs} alt="Jobs" />
        <span>Jobs</span>
      </div>
      <section className="job-main">
        <div className="filter-container">
          <label htmlFor="filter-select" className="filter-label">
            Filter by Tag:
          </label>
          <select
            id="filter-select"
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
          >
            <option value="All">All</option>
            {popularTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>

        {loading &&
          [...Array(3)].map((_, index) => <JobSkeleton key={index} />)}

        {error && <p className="end-message">{error}</p>}
        {!loading && !error && filteredJobs.length === 0 && (
          <p className="end-message">No jobs found for selected filter.</p>
        )}

        {!loading &&
          !error &&
          filteredJobs.map((job) => (
            <article key={job.id} className="job-card">
              <div className="job-card-header">
                <img
                  src={job.logo}
                  alt={`${job.company} logo`}
                  className="job-logo"
                  onError={(e) => (e.target.src = defaultLogo)} // ✅ Fallback if image fails
                />
                <div className="job-title-company">
                  <h2>{job.title}</h2>
                  <p className="job-company">{job.company}</p>
                </div>
                <div className="job-posted-status">
                  <time dateTime={job.postedAgoISO}>{job.postedAgo}</time>
                </div>
              </div>

              <div className="job-tags">
                {(job.tags || []).map((tag) => (
                  <span
                    key={tag}
                    className={`job-tag ${
                      filterTag !== "All" &&
                      filterTag.toLowerCase() !== tag.toLowerCase()
                        ? "dimmed"
                        : ""
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="job-details">
                <div>
                  <strong>Job type</strong>
                  <p>{job.jobType}</p>
                </div>
                <div>
                  <strong>Industry</strong>
                  <p>{job.industry}</p>
                </div>
                <div>
                  <strong>CTC</strong>
                  <p>{job.ctc}</p>
                </div>
                <div>
                  <strong>Location</strong>
                  <p>{job.location}</p>
                </div>
              </div>

              <div className="view-details">
                <Link to={`/jobs/${job.id}`} className="view-details-link">
                  ...View Details
                </Link>
              </div>
            </article>
          ))}
      </section>

      {currentUser && ["admin", "alumni"].includes(currentUser.role) && (
        <button
          className="create-forum-btn"
          onClick={handleCreateJob}
          disabled={authLoading || loading}
        >
          Create Job
        </button>
      )}      
    </div>
  );
};

export default Job;
