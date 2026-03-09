import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "https://skill-sync-backend-522o.onrender.com";

const Avatar = ({ user, size = 32 }) =>
  user?.profilePic ? (
    <img src={user.profilePic} alt={user.name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />
  ) : (
    <div className="avatar-fallback" style={{ width: size, height: size }}>
      {user?.name?.[0]?.toUpperCase() || "?"}
    </div>
  );

const statusLabel = { open: "Open", "in-progress": "In Progress", completed: "Completed" };

const ProjectDetailModal = ({ project, currentUser, onClose, onProjectUpdated }) => {
  const [applications, setApplications] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [applyNote, setApplyNote] = useState("");
  const [updateText, setUpdateText] = useState("");
  const [myApp, setMyApp] = useState(null);
  const [loadingApply, setLoadingApply] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const isOwner = String(project.postedBy?._id) === String(currentUser?._id);
  const isStudent = currentUser?.role === "student";
  const token = localStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchApplications = useCallback(async () => {
    if (!isOwner) return;
    try {
      const res = await axios.get(`${API}/API_B/collaborate/${project._id}/applications`, authHeader);
      setApplications(res.data);
    } catch {}
  }, [project._id, isOwner]);

  const fetchUpdates = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/API_B/collaborate/${project._id}/updates`, authHeader);
      setUpdates(res.data);
    } catch {}
  }, [project._id]);

  const fetchMyApp = useCallback(async () => {
    if (!isStudent) return;
    try {
      const res = await axios.get(`${API}/API_B/collaborate/me/applications`, authHeader);
      const found = res.data.find((a) => String(a.projectId?._id) === String(project._id));
      if (found) setMyApp(found);
    } catch {}
  }, [project._id, isStudent]);

  useEffect(() => {
    fetchUpdates();
    if (isOwner) fetchApplications();
    if (isStudent) fetchMyApp();
  }, [fetchUpdates, fetchApplications, fetchMyApp, isOwner, isStudent]);

  const handleApply = async () => {
    if (!applyNote.trim()) { alert("Please write a short note."); return; }
    setLoadingApply(true);
    try {
      await axios.post(`${API}/API_B/collaborate/${project._id}/apply`, { note: applyNote }, authHeader);
      await fetchMyApp();
      setApplyNote("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to apply.");
    } finally {
      setLoadingApply(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await axios.patch(`${API}/API_B/collaborate/${project._id}/status`, { status: newStatus }, authHeader);
      onProjectUpdated();
    } catch {}
  };

  const handleApplicationAction = async (appId, status) => {
    try {
      await axios.patch(
        `${API}/API_B/collaborate/${project._id}/applications/${appId}`,
        { status },
        authHeader
      );
      setApplications((prev) =>
        prev.map((a) => (String(a._id) === String(appId) ? { ...a, status } : a))
      );
      onProjectUpdated();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update application.");
    }
  };

  const handlePostUpdate = async () => {
    if (!updateText.trim()) return;
    setLoadingUpdate(true);
    try {
      const res = await axios.post(
        `${API}/API_B/collaborate/${project._id}/updates`,
        { content: updateText },
        authHeader
      );
      setUpdates((prev) => [res.data, ...prev]);
      setUpdateText("");
    } catch {} finally {
      setLoadingUpdate(false);
    }
  };

  const deadlineStr = new Date(project.deadline).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  const tabs = isOwner
    ? ["details", "applicants", "updates"]
    : ["details", "updates"];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose}>×</button>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "20px", borderBottom: "2px solid #e5e7eb", paddingBottom: "0" }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: "none",
                border: "none",
                padding: "8px 16px",
                cursor: "pointer",
                fontWeight: activeTab === tab ? "700" : "400",
                color: activeTab === tab ? "#2563eb" : "#4b5563",
                borderBottom: activeTab === tab ? "2px solid #2563eb" : "2px solid transparent",
                marginBottom: "-2px",
                fontSize: "14px",
                textTransform: "capitalize",
              }}
            >
              {tab === "applicants" ? `Applicants (${applications.length})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* ── Details tab ── */}
        {activeTab === "details" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
              <h2 className="modal__title" style={{ margin: 0 }}>{project.title}</h2>
              <span className={`project-card__status project-card__status--${project.status}`}>
                {statusLabel[project.status]}
              </span>
            </div>

            <div className="modal__section">
              <h4>About</h4>
              <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.65, margin: 0 }}>{project.description}</p>
            </div>

            {project.techStack?.length > 0 && (
              <div className="modal__section">
                <h4>Tech Stack</h4>
                <div className="project-card__tech">
                  {project.techStack.map((t) => <span key={t}>{t}</span>)}
                </div>
              </div>
            )}

            <div className="modal__section">
              <h4>Details</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: 14, color: "#374151" }}>
                <div>👥 <strong>{project.slotsRemaining}</strong> / {project.slots} slots remaining</div>
                <div>📅 Deadline: <strong>{deadlineStr}</strong></div>
                <div>👤 Posted by: <strong>{project.postedBy?.name}</strong></div>
              </div>
            </div>

            {/* Alumni: change status */}
            {isOwner && (
              <div className="modal__section">
                <h4>Project Status</h4>
                <div style={{ display: "flex", gap: 8 }}>
                  {["open", "in-progress", "completed"].map((s) => (
                    <button
                      key={s}
                      className={`btn btn--sm ${project.status === s ? "btn--primary" : "btn--ghost"}`}
                      onClick={() => handleUpdateStatus(s)}
                    >
                      {statusLabel[s]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Student: apply section */}
            {isStudent && (
              <div className="modal__section">
                <h4>Apply</h4>
                {myApp ? (
                  <p style={{ fontSize: 14 }}>
                    Your application status:{" "}
                    <span className={`applicant-card__status applicant-card__status--${myApp.status}`}>
                      {myApp.status}
                    </span>
                  </p>
                ) : project.status !== "open" ? (
                  <p style={{ fontSize: 14, color: "#6b7280" }}>This project is no longer accepting applications.</p>
                ) : project.slotsRemaining <= 0 ? (
                  <p style={{ fontSize: 14, color: "#6b7280" }}>All slots are filled.</p>
                ) : (
                  <>
                    <div className="form-group">
                      <textarea
                        placeholder="Why do you want to join this project? What skills do you bring?"
                        value={applyNote}
                        onChange={(e) => setApplyNote(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <button className="btn btn--primary" onClick={handleApply} disabled={loadingApply}>
                      {loadingApply ? "Submitting…" : "Submit Application"}
                    </button>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {/* ── Applicants tab (owner only) ── */}
        {activeTab === "applicants" && isOwner && (
          <div>
            {applications.length === 0 ? (
              <p style={{ color: "#6b7280", fontSize: 14 }}>No applications yet.</p>
            ) : (
              applications.map((app) => (
                <div className="applicant-card" key={app._id}>
                  {app.studentId?.profilePic ? (
                    <img src={app.studentId.profilePic} alt={app.studentId.name} />
                  ) : (
                    <div className="avatar-fallback">{app.studentId?.name?.[0]?.toUpperCase()}</div>
                  )}
                  <div className="applicant-card__info">
                    <p className="applicant-card__name">{app.studentId?.name}</p>
                    <p style={{ fontSize: 12, color: "#6b7280", margin: "1px 0" }}>{app.studentId?.email}</p>
                    {app.note && <p className="applicant-card__note">"{app.note}"</p>}
                    {app.studentId?.skills?.length > 0 && (
                      <div className="applicant-card__skills">
                        {app.studentId.skills.slice(0, 5).map((s) => <span key={s}>{s}</span>)}
                      </div>
                    )}
                  </div>
                  <div className="applicant-card__actions">
                    {app.status === "pending" ? (
                      <>
                        <button className="btn btn--success btn--sm" onClick={() => handleApplicationAction(app._id, "accepted")}>Accept</button>
                        <button className="btn btn--danger btn--sm" onClick={() => handleApplicationAction(app._id, "rejected")}>Reject</button>
                      </>
                    ) : (
                      <span className={`applicant-card__status applicant-card__status--${app.status}`}>{app.status}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Updates tab ── */}
        {activeTab === "updates" && (
          <div>
            {isOwner && (
              <div className="update-input">
                <textarea
                  placeholder="Post a project update, milestone, or announcement…"
                  value={updateText}
                  onChange={(e) => setUpdateText(e.target.value)}
                />
                <button className="btn btn--primary" onClick={handlePostUpdate} disabled={loadingUpdate || !updateText.trim()}>
                  {loadingUpdate ? "…" : "Post"}
                </button>
              </div>
            )}
            <div className="update-feed" style={{ marginTop: 16 }}>
              {updates.length === 0 ? (
                <p style={{ color: "#6b7280", fontSize: 14 }}>No updates yet.</p>
              ) : (
                updates.map((u) => (
                  <div className="update-feed__item" key={u._id}>
                    <Avatar user={u.postedBy} />
                    <div className="update-feed__bubble">
                      <p>{u.content}</p>
                      <time>{new Date(u.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</time>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailModal;