import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./Collaborate.scss";
import ProjectCard from "./ProjectCard";
import ProjectDetailModal from "./ProjectDetailModal";
import PostProjectModal from "./PostProjectModal";

const API = process.env.REACT_APP_API_URL || "https://skill-sync-backend-522o.onrender.com";

const Collaborate = () => {
  const [projects, setProjects] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [techFilter, setTechFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const rawUser = localStorage.getItem("user") || localStorage.getItem("userData");
  const currentUser = rawUser ? JSON.parse(rawUser) : null;
  const token = localStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const canPost = currentUser?.role === "alumni" || currentUser?.role === "faculty";
  const isStudent = currentUser?.role === "student";

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (techFilter) params.tech = techFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await axios.get(`${API}/API_B/collaborate`, { params });
      setProjects(res.data);
    } catch (err) {
      console.error("Failed to fetch projects", err);
    } finally {
      setLoading(false);
    }
  }, [techFilter, statusFilter]);

  const fetchMyApplications = useCallback(async () => {
    if (!isStudent || !token) return;
    try {
      const res = await axios.get(`${API}/API_B/collaborate/me/applications`, authHeader);
      setMyApplications(res.data);
    } catch {}
  }, [isStudent, token]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    fetchMyApplications();
  }, [fetchMyApplications]);

  const handlePostProject = async (data) => {
    try {
      await axios.post(`${API}/API_B/collaborate`, data, authHeader);
      setShowPostModal(false);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to post project.");
    }
  };

  const getMyAppStatus = (projectId) => {
    const app = myApplications.find(
      (a) => String(a.projectId?._id) === String(projectId)
    );
    return app?.status || null;
  };

  return (
    <div className="collaborate-page">
      {/* Header */}
      <div className="collaborate-page__header">
        <h1>
          Collaborate
          <span>Alumni & faculty post projects · Students apply & build together</span>
        </h1>
        {canPost && (
          <button className="btn btn--primary" onClick={() => setShowPostModal(true)}>
            + Post Project
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="collaborate-page__filters">
        <input
          placeholder="Search by technology (e.g. React, Python…)"
          value={techFilter}
          onChange={(e) => setTechFilter(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchProjects()}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <button className="btn btn--ghost" onClick={fetchProjects}>Search</button>
        {(techFilter || statusFilter) && (
          <button className="btn btn--ghost" onClick={() => { setTechFilter(""); setStatusFilter(""); }}>
            Clear
          </button>
        )}
      </div>

      {/* Project grid */}
      {loading ? (
        <p style={{ textAlign: "center", color: "#6b7280", padding: "40px 0" }}>Loading projects…</p>
      ) : projects.length === 0 ? (
        <div className="collaborate-page__empty">
          <p style={{ fontSize: "2rem" }}>🛠️</p>
          <p>No projects found. {canPost ? "Be the first to post one!" : "Check back soon."}</p>
        </div>
      ) : (
        <div className="collaborate-page__grid">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              myApplicationStatus={getMyAppStatus(project._id)}
              onClick={() => setSelectedProject(project)}
            />
          ))}
        </div>
      )}

      {/* My applications summary (students only) */}
      {isStudent && myApplications.length > 0 && (
        <div className="collaborate-page__my-apps">
          <h2>My Applications</h2>
          {myApplications.map((app) => (
            <div className="my-app-row" key={app._id}>
              <div className="my-app-row__title">
                {app.projectId?.title || "Project"}
                <span>by {app.projectId?.postedBy?.name}</span>
              </div>
              <span className={`applicant-card__status applicant-card__status--${app.status}`}>
                {app.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          currentUser={currentUser}
          onClose={() => setSelectedProject(null)}
          onProjectUpdated={() => {
            fetchProjects();
            fetchMyApplications();
            setSelectedProject(null);
          }}
        />
      )}

      {showPostModal && (
        <PostProjectModal
          onClose={() => setShowPostModal(false)}
          onSubmit={handlePostProject}
        />
      )}
    </div>
  );
};

export default Collaborate;