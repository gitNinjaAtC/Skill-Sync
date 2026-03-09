import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, X, Briefcase, Building2, MapPin, IndianRupee, Calendar, FileText, CheckCircle2, Clock, ArrowLeft } from "lucide-react";
import "./jobDetail.scss";

const JobDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [fetchingApplicants, setFetchingApplicants] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    const API_BASE_URL = window.location.hostname === "localhost"
        ? "http://localhost:8800"
        : "https://skill-sync-backend-522o.onrender.com";

    const defaultLogo = "https://via.placeholder.com/150?text=Company+Logo";

    const getFullUrl = (path) => {
        if (!path) return null;
        if (path.startsWith("http")) return path;
        return `${API_BASE_URL}${path}`;
    };

    const fetchJobData = async () => {
        setLoading(true);
        const token = localStorage.getItem("adminToken");
        try {
            const res = await axios.get(`${API_BASE_URL}/API_B/jobs/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });
            setJob(res.data);
            if (res.data.approval_status === "Approved") {
                fetchApplicants();
            }
        } catch (error) {
            console.error("Error fetching job details:", error);
            setError("Failed to load job details.");
        } finally {
            setLoading(false);
        }
    };

    const fetchApplicants = async () => {
        setFetchingApplicants(true);
        const token = localStorage.getItem("adminToken");
        try {
            const res = await axios.get(`${API_BASE_URL}/API_B/jobs/${id}/applications`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });
            setApplicants(res.data);
        } catch (error) {
            console.error("Error fetching applicants:", error);
        } finally {
            setFetchingApplicants(false);
        }
    };

    useEffect(() => {
        fetchJobData();
    }, [id]);

    const handleAction = async (action) => {
        if (!window.confirm(`Are you sure you want to ${action} this job?`)) return;
        
        setActionLoading(true);
        const token = localStorage.getItem("adminToken");
        try {
            await axios.post(`${API_BASE_URL}/API_B/jobs/${action}/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });
            alert(`Job ${action === "approve" ? "approved" : "rejected"} successfully!`);
            fetchJobData();
        } catch (error) {
            console.error(`Error during ${action}:`, error);
            alert(`Failed to ${action} job.`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleStatusChange = async (applicationId, newStatus) => {
        setUpdatingStatus(applicationId);
        const token = localStorage.getItem("adminToken");
        try {
            await axios.put(`${API_BASE_URL}/API_B/jobs/application/${applicationId}/status`, 
                { status: newStatus },
                {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true
                }
            );
            alert("Status updated successfully!");
            fetchApplicants();
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status.");
        } finally {
            setUpdatingStatus(null);
        }
    };

    if (loading) return <div className="job-detail-page"><h2>Loading Job Details...</h2></div>;
    if (error) return <div className="job-detail-page"><div className="error-message">{error}</div></div>;
    if (!job) return <div className="job-detail-page"><h2>Job not found.</h2></div>;

    return (
        <div className="job-detail-page">
            <div className="page-header">
                <button className="back-btn" onClick={() => navigate("/jobs")}>
                    <ArrowLeft size={20} /> Back to Dashboard
                </button>
            </div>

            <div className="job-detail-container">
                <div className="job-main-header">
                    <div className="org-info-large">
                        <img 
                            src={getFullUrl(job.logo_path) || defaultLogo} 
                            alt={job.organisation_name} 
                            className="org-logo-large"
                            onError={(e) => { e.target.src = defaultLogo; }}
                        />
                        <div className="title-block">
                            <h1>{job.job_title}</h1>
                            <p className="org-name-large">{job.organisation_name}</p>
                        </div>
                    </div>
                    <div className="header-status">
                        <span className={`status-pill-large ${job.approval_status.toLowerCase()}`}>
                            {job.approval_status}
                        </span>
                        <p className="posted-on">Posted on: {new Date(job.created_at).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="page-grid">
                    <div className="detail-card main-info">
                        <h3><Briefcase size={20} /> Job Overview</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <label><Briefcase size={16} /> Employment Type</label>
                                <span>{job.employment_type || "Not Specified"}</span>
                            </div>
                            <div className="info-item">
                                <label><Building2 size={16} /> Offer Type</label>
                                <span>{job.offer_type || "Normal"}</span>
                            </div>
                            <div className="info-item">
                                <label><MapPin size={16} /> Location</label>
                                <span>{job.location} ({job.remote_working || "WFO"})</span>
                            </div>
                            <div className="info-item">
                                <label><IndianRupee size={16} /> Compensation (CTC)</label>
                                <span>₹{job.cost_to_company || "0"}</span>
                            </div>
                            <div className="info-item">
                                <label><Calendar size={16} /> Registration Date</label>
                                <span>
                                    {job.registration_start_date ? new Date(job.registration_start_date).toLocaleDateString() : "N/A"} - 
                                    {job.registration_end_date ? new Date(job.registration_end_date).toLocaleDateString() : "N/A"}
                                </span>
                            </div>
                            <div className="info-item">
                                <label><Clock size={16} /> Joining Date</label>
                                <span>{job.joining_date ? new Date(job.joining_date).toLocaleDateString() : "To be decided"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="detail-card action-card">
                        <h3>Action Center</h3>
                        {job.approval_status === "Pending" ? (
                            <div className="page-action-buttons">
                                <button 
                                    className="btn-approve-full" 
                                    onClick={() => handleAction("approve")}
                                    disabled={actionLoading}
                                >
                                    <CheckCircle2 size={18} /> Approve Posting
                                </button>
                                <button 
                                    className="btn-reject-full" 
                                    onClick={() => handleAction("reject")}
                                    disabled={actionLoading}
                                >
                                    <X size={18} /> Reject Posting
                                </button>
                            </div>
                        ) : (
                            <div className="status-confirmed">
                                <p>This job post is <strong>{job.approval_status.toLowerCase()}</strong>.</p>
                                {job.approval_status === "Approved" && (
                                    <div className="stats-mini">
                                        <div className="stat-box">
                                            <strong>{applicants.length}</strong>
                                            <span>Applicants</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="content-layout">
                    <div className="main-content">
                        <section className="detail-section">
                            <h3><FileText size={20} /> Job Description</h3>
                            <div className="text-content">
                                {job.job_description}
                            </div>
                        </section>

                        {job.skills_required && (
                            <section className="detail-section">
                                <h3>Skills Required</h3>
                                <div className="skills-container">
                                    {job.skills_required.split(',').map((skill, i) => (
                                        <span key={i} className="skill-badge">{skill.trim()}</span>
                                    ))}
                                </div>
                            </section>
                        )}

                        {job.selection_process && (
                            <section className="detail-section">
                                <h3>Selection Process</h3>
                                <div className="text-content">{job.selection_process}</div>
                            </section>
                        )}

                        {job.approval_status === "Approved" && (
                            <section className="detail-section applicants-full">
                                <div className="section-header-row">
                                    <h3><Clock size={20} /> Applicant Tracking</h3>
                                    <span className="count">{applicants.length} Students</span>
                                </div>

                                {fetchingApplicants ? (
                                    <p>Loading applicants...</p>
                                ) : applicants.length > 0 ? (
                                    <div className="applicants-table-wrapper">
                                        <table className="admin-app-table">
                                            <thead>
                                                <tr>
                                                    <th>Student</th>
                                                    <th>Email</th>
                                                    <th>Applied At</th>
                                                    <th>Status</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {applicants.map((app) => (
                                                    <tr key={app._id}>
                                                        <td>
                                                            <div className="user-info">
                                                                <strong>{app.studentId?.name}</strong>
                                                                <small>@{app.studentId?.username}</small>
                                                            </div>
                                                        </td>
                                                        <td>{app.studentId?.email}</td>
                                                        <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                                                        <td>
                                                            <span className={`status-pill-small ${app.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                                                                {app.status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <select 
                                                                className="app-status-select"
                                                                value={app.status}
                                                                disabled={updatingStatus === app._id}
                                                                onChange={(e) => handleStatusChange(app._id, e.target.value)}
                                                            >
                                                                <option value="Registered">Registered</option>
                                                                <option value="In Progress">In Progress</option>
                                                                <option value="Rejected">Rejected</option>
                                                                <option value="Selected">Selected</option>
                                                                <option value="Offered">Offered</option>
                                                            </select>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="no-data-text">No applications received yet.</p>
                                )}
                            </section>
                        )}
                    </div>

                    <div className="side-content">
                        <section className="detail-section">
                            <h3>Attachments</h3>
                            <div className="attachment-list">
                                {job.offer_letter_path ? (
                                    <a href={getFullUrl(job.offer_letter_path)} target="_blank" rel="noreferrer" className="attach-item">
                                        <FileText size={18} /> Offer Letter
                                    </a>
                                ) : null}
                                {job.letter_of_intent_path ? (
                                    <a href={getFullUrl(job.letter_of_intent_path)} target="_blank" rel="noreferrer" className="attach-item">
                                        <FileText size={18} /> Letter of Intent
                                    </a>
                                ) : null}
                                {!job.offer_letter_path && !job.letter_of_intent_path && <p>No documents.</p>}
                            </div>
                        </section>

                        {job.bond_details && (
                            <section className="detail-section">
                                <h3>Bond Details</h3>
                                <div className="text-content">{job.bond_details}</div>
                            </section>
                        )}
                        
                        {job.other_benefits && (
                            <section className="detail-section">
                                <h3>Other Benefits</h3>
                                <div className="text-content">{job.other_benefits}</div>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetail;
