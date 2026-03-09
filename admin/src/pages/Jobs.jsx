import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, X, Briefcase, Building2, MapPin, IndianRupee, Calendar, FileText, CheckCircle2, Clock } from "lucide-react";
import "./jobsDashboard.scss";

const JobsDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        Pending: 0,
        Approved: 0,
        Rejected: 0,
        Total: 0,
    });
    const [jobs, setJobs] = useState([]);
    const [activeTab, setActiveTab] = useState("Pending");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    const API_BASE_URL = window.location.hostname === "localhost"
        ? "http://localhost:8800"
        : "https://skill-sync-backend-522o.onrender.com";

    const fetchAdminData = async (status = activeTab) => {
        setLoading(true);
        const token = localStorage.getItem("adminToken");
        try {
            const [statsRes, jobsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/API_B/jobs/admin/stats`, {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true
                }),
                axios.get(`${API_BASE_URL}/API_B/jobs/admin/all?status=${status}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true
                })
            ]);
            setStats(statsRes.data);
            setJobs(jobsRes.data);
            setError(null);
        } catch (error) {
            console.error("Error fetching admin job data:", error);
            setError(error.response?.data?.message || "Failed to fetch data from server.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminData(activeTab);
    }, [activeTab]);

    const handleAction = async (jobId, action) => {
        if (!window.confirm(`Are you sure you want to ${action} this job?`)) return;
        
        setActionLoading(jobId);
        const token = localStorage.getItem("adminToken");
        try {
            await axios.post(`${API_BASE_URL}/API_B/jobs/${action}/${jobId}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });
            alert(`Job ${action === "approve" ? "approved" : "rejected"} successfully!`);
            fetchAdminData();
        } catch (error) {
            console.error(`Error during ${action}:`, error);
            alert(`Failed to ${action} job.`);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return <div className="jobs-dashboard"><h2>Loading Job Data...</h2></div>;

    return (
        <div className="jobs-dashboard">
            <div className="dashboard-header">
                <h2>Job Post Overview</h2>
                <div className="admin-tabs">
                    <button 
                        className={`tab-btn ${activeTab === "Pending" ? "active" : ""}`}
                        onClick={() => setActiveTab("Pending")}
                    >
                        Pending Requests
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === "Approved" ? "active" : ""}`}
                        onClick={() => setActiveTab("Approved")}
                    >
                        Approved Posts
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === "Rejected" ? "active" : ""}`}
                        onClick={() => setActiveTab("Rejected")}
                    >
                        Rejected Posts
                    </button>
                </div>
            </div>

            <div className="job-cards">
                <div className="job-card total" onClick={() => setActiveTab("")}>
                    <i className="icon">📁</i>
                    <h3>{stats.Total}</h3>
                    <p>Total Job Request</p>
                </div>
                <div className={`job-card new ${activeTab === "Pending" ? "selected" : ""}`} onClick={() => setActiveTab("Pending")}>
                    <i className="icon">📄</i>
                    <h3>{stats.Pending}</h3>
                    <p>New Job Post Request</p>
                </div>
                <div className={`job-card approved ${activeTab === "Approved" ? "selected" : ""}`} onClick={() => setActiveTab("Approved")}>
                    <i className="icon">✅</i>
                    <h3>{stats.Approved}</h3>
                    <p>Approved Job Post</p>
                </div>
                <div className={`job-card cancelled ${activeTab === "Rejected" ? "selected" : ""}`} onClick={() => setActiveTab("Rejected")}>
                    <i className="icon">❌</i>
                    <h3>{stats.Rejected}</h3>
                    <p>Rejected Job Post</p>
                </div>
            </div>

            <div className="jobs-section">
                <div className="section-header">
                    <h3>{activeTab || "All"} Job Requests</h3>
                    <span className="count-badge">{jobs.length}</span>
                </div>

                {jobs.length === 0 ? (
                    <div className="no-data">
                        <p>No {activeTab.toLowerCase()} job requests found.</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="jobs-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Organization</th>
                                    <th>Posted By</th>
                                    <th>Posted On</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobs.map((job) => (
                                    <tr key={job._id}>
                                        <td><strong>{job.job_title}</strong></td>
                                        <td>{job.organisation_name}</td>
                                        <td>{job.posted_by}</td>
                                        <td>{new Date(job.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`status-pill ${job.approval_status.toLowerCase()}`}>
                                                {job.approval_status}
                                            </span>
                                        </td>
                                        <td className="actions">
                                            <button 
                                                className="btn-view" 
                                                onClick={() => navigate(`/jobs/${job._id}`)}
                                                title="View Full Details"
                                            >
                                                <Eye size={16} /> View
                                            </button>
                                            {job.approval_status !== "Approved" && (
                                                <button 
                                                    className="btn-approve" 
                                                    onClick={() => handleAction(job._id, "approve")}
                                                    disabled={actionLoading === job._id}
                                                    title="Approve Job"
                                                >
                                                    Approve
                                                </button>
                                            )}
                                            {job.approval_status !== "Rejected" && (
                                                <button 
                                                    className="btn-reject" 
                                                    onClick={() => handleAction(job._id, "reject")}
                                                    disabled={actionLoading === job._id}
                                                    title="Reject Job"
                                                >
                                                    Reject
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobsDashboard;
