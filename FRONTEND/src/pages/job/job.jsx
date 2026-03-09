import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { makeRequest, apiBaseUrl } from "../../axios";
import "./Job.scss";
import { AuthContext } from "../../context/authContext";
import Jobs from "../../assets/Job.png";
import JobSkeleton from "./JobSkeleton.jsx";
import defaultLogo from "../../assets/default_logo.jpg";

const popularTags = [
  "CSS", "Express.Js", "Html", "Python", "Javascript",
  "Mongodb", "Node.js", "React.js", "Teamwork",
  "Understanding Of Rest Apis And Git", "It / Computers - Software",
];

const STATUS_STEPS = ["Registered", "In Progress", "Selected", "Offered"];

const Job = () => {
  const { currentUser, loading: authLoading } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [rawApplications, setRawApplications] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [filterTag, setFilterTag] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setFilterStatus("All");
    try {
      let endpoint = "/API_B/jobs";
      if (activeTab === "my-jobs") endpoint = "/API_B/jobs/my/jobs";
      else if (activeTab === "my-applications" || activeTab === "offers") endpoint = "/API_B/jobs/my/applications";
      else if (activeTab === "applicants") endpoint = "/API_B/jobs/my/applicants";

      const response = await makeRequest.get(endpoint);
      const data = response.data || [];

      if (activeTab === "applicants") {
        setRawApplications(data);
        setJobs([]);
        setLoading(false);
        return;
      }

      let transformed = data.map((item) => {
        const job = item.jobId || item;
        const id = job.job_id || job._id || job.id;
        return {
          id,
          title: job.job_title || "Untitled Job",
          company: job.organisation_name || "Unknown Company",
          tags: job.skills_required ? job.skills_required.split(",").map((t) => t.trim()) : [],
          logo: job.logo_path?.toLowerCase().includes("/uploads/") ? `${apiBaseUrl}${job.logo_path}` : defaultLogo,
          jobType: job.offer_type || "N/A",
          industry: job.employment_type || "N/A",
          ctc: job.cost_to_company?.toString() || "N/A",
          location: job.location || "N/A",
          postedAgo: new Date(job.created_at || item.appliedAt).toLocaleDateString(),
          status: item.status || job.approval_status,
          isApplication: !!item.status,
          applicationId: item._id,
          registrationEndDate: job.registration_end_date ? new Date(job.registration_end_date) : null,
        };
      });

      if (activeTab === "all" && currentUser?.role?.toLowerCase() === "student") {
        try {
          const appsRes = await makeRequest.get("/API_B/jobs/my/applications");
          const myApps = appsRes.data || [];
          transformed = transformed.map(job => {
            const app = myApps.find(a => (a.jobId?._id || a.jobId) === job.id);
            return app ? { ...job, status: app.status, isApplication: true } : job;
          });
        } catch (err) {
          console.error("Error fetching student apps for explore tab:", err);
        }
      }

      if (activeTab === "offers") transformed = transformed.filter(j => j.status === "Offered");
      else if (activeTab === "my-applications") transformed = transformed.filter(j => j.status !== "Offered");
      else if (activeTab === "all") transformed = transformed.filter(j => j.status !== "Rejected" || j.isApplication);

      setJobs(transformed);
    } catch (err) {
      console.error(err);
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await makeRequest.put(`/API_B/jobs/application/${applicationId}/status`, { status: newStatus });
      fetchData();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
  };

  const handleCreateJob = () => navigate("/jobs/CreateOffer");

  // ── Group applications by job for the Applicants tab ──
  const groupedByJob = React.useMemo(() => {
    if (activeTab !== "applicants") return [];
    const map = {};
    rawApplications.forEach(app => {
      const job = app.jobId || {};
      const jobId = job._id || "unknown";
      if (!map[jobId]) {
        map[jobId] = {
          jobId,
          title: job.job_title || "Untitled Job",
          company: job.organisation_name || "Unknown Company",
          logo: job.logo_path?.toLowerCase().includes("/uploads/") ? `${apiBaseUrl}${job.logo_path}` : defaultLogo,
          jobType: job.offer_type || "N/A",
          ctc: job.cost_to_company?.toString() || "N/A",
          location: job.location || "N/A",
          tags: job.skills_required ? job.skills_required.split(",").map(t => t.trim()) : [],
          applicants: [],
        };
      }
      map[jobId].applicants.push({
        applicationId: app._id,
        studentUserId: app.studentId?._id,
        name: app.studentId?.name || "Unknown",
        email: app.studentId?.email || "—",
        appliedAt: app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "—",
        status: app.status || "Registered",
      });
    });
    return Object.values(map);
  }, [rawApplications, activeTab]);

  const totalApplicants = groupedByJob.reduce((sum, j) => sum + j.applicants.length, 0);

  const filteredGrouped = groupedByJob.filter(jobGroup =>
    filterTag === "All" || (jobGroup.tags || []).some(t => t.toLowerCase() === filterTag.toLowerCase())
  );

  const filteredJobs = jobs.filter(job =>
    filterTag === "All" ? true : (job.tags || []).some(tag => tag.toLowerCase() === filterTag.toLowerCase())
  );

  // ── Mini Progress tracker for each row in the applicants table ──
  const MiniTracker = ({ currentStatus, applicationId }) => {
    const currentIndex = STATUS_STEPS.indexOf(currentStatus);
    return (
      <div className="mini-tracker">
        {STATUS_STEPS.map((step, idx) => {
          const isCompleted = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          return (
            <React.Fragment key={step}>
              <button
                className={`mini-step ${isCompleted ? "completed" : ""} ${isCurrent ? "current" : ""}`}
                onClick={() => handleStatusChange(applicationId, step)}
                title={`Set to ${step}`}
              >
                <span className="mini-dot">{isCompleted ? "✓" : idx + 1}</span>
                <span className="mini-label">{step}</span>
              </button>
              {idx < STATUS_STEPS.length - 1 && (
                <div className={`mini-line ${isCompleted && idx < currentIndex ? "filled" : ""}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className="forum-container">
      {/* ── HEADER ── */}
      <div className="job-header">
        <div className="left-section">
          <img src={Jobs} alt="Jobs" />
          <span>Jobs</span>
        </div>
        <div className="right-section">
          {currentUser && ["admin", "alumni", "faculty"].includes(currentUser.role?.toLowerCase()) && (
            <button className="create-job-btn" onClick={handleCreateJob} disabled={authLoading || loading}>
              Create Job
            </button>
          )}
          <div className="filter-container">
            <select id="filter-select" value={filterTag} onChange={(e) => setFilterTag(e.target.value)}>
              <option value="All">All Tags</option>
              {popularTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="job-tabs">
        <button className={activeTab === "all" ? "active" : ""} onClick={() => setActiveTab("all")}>
          Explore Jobs
        </button>
        {currentUser && ["alumni", "faculty", "admin"].includes(currentUser.role?.toLowerCase()) && (
          <button className={activeTab === "my-jobs" ? "active" : ""} onClick={() => setActiveTab("my-jobs")}>
            My Postings
          </button>
        )}
        {currentUser && ["alumni", "faculty", "admin"].includes(currentUser.role?.toLowerCase()) && (
          <button className={activeTab === "applicants" ? "active" : ""} onClick={() => setActiveTab("applicants")}>
            Applicants
            {activeTab === "applicants" && totalApplicants > 0 && (
              <span className="tab-count-badge">{totalApplicants}</span>
            )}
          </button>
        )}
        {currentUser && currentUser.role?.toLowerCase() === "student" && (
          <>
            <button className={activeTab === "my-applications" ? "active" : ""} onClick={() => setActiveTab("my-applications")}>
              My Applications
            </button>
            <button className={activeTab === "offers" ? "active" : ""} onClick={() => setActiveTab("offers")}>
              Offers
            </button>
          </>
        )}
      </div>

      {/* ── APPLICANTS TAB: JOB-CENTRIC VIEW ── */}
      {activeTab === "applicants" && (
        <section className="job-main">
          {loading && [...Array(2)].map((_, i) => <JobSkeleton key={i} />)}
          {error && <p className="end-message">{error}</p>}

          {!loading && !error && filteredGrouped.length > 0 && (
            <div className="applicant-filter-bar">
              <span className="filter-label">Filter by status:</span>
              {["All", ...STATUS_STEPS, "Rejected"].map(s => (
                <button
                  key={s}
                  className={`filter-status-btn ${filterStatus === s ? "active" : ""} status-${s.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setFilterStatus(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {!loading && !error && filteredGrouped.length === 0 && (
            <p className="end-message">No applicants yet.</p>
          )}

          {!loading && !error && filteredGrouped.map(jobGroup => {
            const visibleApplicants = filterStatus === "All"
              ? jobGroup.applicants
              : jobGroup.applicants.filter(a => a.status === filterStatus);
            if (visibleApplicants.length === 0) return null;

            return (
              <article key={jobGroup.jobId} className="job-card applicant-job-card">
                {/* Job Header */}
                <div className="applicant-job-header">
                  <div className="ajh-left">
                    <img src={jobGroup.logo} alt="logo" className="job-logo" onError={e => e.target.src = defaultLogo} />
                    <div>
                      <h2>{jobGroup.title}</h2>
                      <p className="job-company">{jobGroup.company}</p>
                    </div>
                  </div>
                  <div className="ajh-right">
                    <div className="ajh-meta">
                      <span><strong>Location:</strong> {jobGroup.location}</span>
                      <span><strong>Type:</strong> {jobGroup.jobType}</span>
                      <span><strong>CTC:</strong> ₹{jobGroup.ctc}</span>
                    </div>
                    <div className="applicant-count-badge">
                      <span className="count-num">{visibleApplicants.length}</span>
                      <span className="count-label">Applicant{visibleApplicants.length !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {jobGroup.tags.length > 0 && (
                  <div className="job-tags" style={{ margin: "0.75rem 0 1.25rem" }}>
                    {jobGroup.tags.map(tag => (
                      <span key={tag} className={`job-tag ${filterTag !== "All" && filterTag.toLowerCase() !== tag.toLowerCase() ? "dimmed" : ""}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Applicants Table */}
                <div className="applicants-table-wrapper">
                  <table className="applicants-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Student</th>
                        <th>Email</th>
                        <th>Applied On</th>
                        <th>Progress</th>
                        <th>Update Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleApplicants.map((applicant, idx) => (
                        <tr key={applicant.applicationId}>
                          <td className="row-num">{idx + 1}</td>
                          <td className="student-name">
                            {applicant.studentUserId ? (
                              <Link
                                to={`/profile/${applicant.studentUserId}`}
                                className="student-profile-link"
                              >
                                {applicant.name}
                              </Link>
                            ) : applicant.name}
                          </td>
                          <td><a href={`mailto:${applicant.email}`} className="email-link">{applicant.email}</a></td>
                          <td className="applied-date">{applicant.appliedAt}</td>
                          <td>
                            <MiniTracker currentStatus={applicant.status} applicationId={applicant.applicationId} />
                          </td>
                          <td>
                            <select
                              className="status-select-dropdown"
                              value={applicant.status}
                              onChange={e => handleStatusChange(applicant.applicationId, e.target.value)}
                            >
                              {[...STATUS_STEPS, "Rejected"].map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* ── ALL OTHER TABS ── */}
      {activeTab !== "applicants" && (
        <section className="job-main">
          {loading && [...Array(3)].map((_, index) => <JobSkeleton key={index} />)}
          {error && <p className="end-message">{error}</p>}
          {!loading && !error && filteredJobs.length === 0 && (
            <p className="end-message">No jobs found.</p>
          )}
          {!loading && !error && filteredJobs.map((job) => (
            <article key={`${job.id}-${job.applicationId || ""}`} className="job-card">
              <div className="job-card-header">
                <img src={job.logo} alt={`${job.company} logo`} className="job-logo" onError={(e) => (e.target.src = defaultLogo)} />
                <div className="job-title-company">
                  <h2>{job.title}</h2>
                  <p className="job-company">{job.company}</p>
                </div>
                <div className="job-posted-status">
                  <span className={`status-badge ${job.status?.toLowerCase().replace(/\s+/g, "-")}`}>{job.status}</span>
                  <time>{job.postedAgo}</time>
                </div>
              </div>
              <div className="job-tags">
                {(job.tags || []).map((tag) => (
                  <span key={tag} className={`job-tag ${filterTag !== "All" && filterTag.toLowerCase() !== tag.toLowerCase() ? "dimmed" : ""}`}>
                    {tag}
                  </span>
                ))}
              </div>
              <div className="job-details">
                <div><strong>Location</strong><p>{job.location}</p></div>
                <div><strong>Job type</strong><p>{job.jobType}</p></div>
                <div><strong>CTC</strong><p>₹{job.ctc}</p></div>
              </div>
              <div className="view-details">
                <Link to={`/jobs/${job.id}`} className="view-details-link">...View Details</Link>
                {currentUser?.role?.toLowerCase() === "student" && activeTab === "all" && (() => {
                  // Already applied
                  if (job.isApplication) {
                    return (
                      <span className="applied-badge">
                        <span className="applied-check">✓</span> Applied
                        {job.status && job.status !== "Approved" && (
                          <span className={`applied-status status-${job.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                            {job.status}
                          </span>
                        )}
                      </span>
                    );
                  }
                  // Registration closed
                  const now = new Date();
                  if (job.registrationEndDate && job.registrationEndDate < now) {
                    return (
                      <span className="registration-closed">
                        <span className="closed-icon">🔒</span>
                        Registration Closed
                        <span className="closed-date">
                          (Closed: {job.registrationEndDate.toLocaleDateString("en-IN", {
                            day: "2-digit", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit", hour12: true
                          })})
                        </span>
                      </span>
                    );
                  }
                  // Open to apply
                  return (
                    <button className="apply-btn-card" onClick={() => navigate(`/jobs/${job.id}`)}>
                      Apply Now
                      {job.registrationEndDate && (
                        <span className="apply-deadline">
                          Closes {job.registrationEndDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                        </span>
                      )}
                    </button>
                  );
                })()}
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
};

export default Job;
