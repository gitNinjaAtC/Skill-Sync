import React, { useState, useRef, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import "./Batches.scss";
import axios from "axios";
import Swal from "sweetalert2";

const generateBatches = (startYear = 2007) => {
  const currentYear = new Date().getFullYear();
  const batches = [];
  for (let year = startYear; year <= currentYear; year++) {
    const end = year + 4;
    if (end <= currentYear + 4) batches.push(`${year}-${end}`);
  }
  return batches;
};

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8800"
    : "https://skill-sync-backend-522o.onrender.com";

// ── Modal Component ──────────────────────────────────────────────────────────
const Modal = ({ isOpen, onClose, title, icon, children, accentColor }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ "--accent": accentColor }}>
        <div className="modal-header">
          <div className="modal-title-row">
            <span className="modal-icon">{icon}</span>
            <h2 className="modal-title">{title}</h2>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

// ── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon, color, accent, onClick, animated }) => (
  <div
    className={`stats-card stats-card--${color} ${onClick ? "stats-card--clickable" : ""}`}
    onClick={onClick}
    title={onClick ? `Click to view ${label} details` : undefined}
  >
    <div className="stats-card__icon">{icon}</div>
    <span className="stats-card__value" style={animated ? { "--accent": accent } : {}}>
      {value}
    </span>
    <span className="stats-card__label">{label}</span>
    <span className="stats-card__sub">{sub}</span>
    {onClick && <span className="stats-card__cta">View Details →</span>}
  </div>
);

const Batches = () => {
  // ── Upload form state ────────────────────────────────────────────────────
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [responseData, setResponseData] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [customBranch, setCustomBranch] = useState("");
  const [branches, setBranches] = useState(["CSE", "ECE", "ME", "CE"]);
  const [selectedRole, setSelectedRole] = useState("");
  const [roles, setRoles] = useState(["Student", "Alumni"]);
  const [customRole, setCustomRole] = useState("");
  const [fileInfo, setFileInfo] = useState({ rows: 0, columns: 0 });
  const [loading, setLoading] = useState(false);
  const [customBatchYear, setCustomBatchYear] = useState("");
  const [customBatches, setCustomBatches] = useState([]);

  // ── View students state ──────────────────────────────────────────────────
  const [viewedStudents, setViewedStudents] = useState([]);
  const [viewedBatch, setViewedBatch] = useState("");
  const [viewedBranch, setViewedBranch] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [allStates, setAllStates] = useState([]);
  const [allDistricts, setAllDistricts] = useState([]);

  // ── Stats state ──────────────────────────────────────────────────────────
  const [statsLoading, setStatsLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState("");
  const [statsBatchFilter, setStatsBatchFilter] = useState("");
  const [statsBranchFilter, setStatsBranchFilter] = useState("");

  // ── Modal state ──────────────────────────────────────────────────────────
  const [activeModal, setActiveModal] = useState(null);

  const inputRef = useRef();
  const allowedTypes = ["csv", "xlsx"];
  const defaultBatches = generateBatches();
  const batchOptions = [...defaultBatches, ...customBatches];

  // ── Fetch stats ──────────────────────────────────────────────────────────
  const fetchStudentStats = useCallback(async (batchF = "", branchF = "") => {
    setStatsLoading(true);
    setStatsError("");
    try {
      const params = {};
      if (batchF) params.batch = batchF;
      if (branchF) params.branch = branchF;
      const res = await axios.get(`${API_BASE_URL}/API_B/admin/student-stats`, { params });
      setStats(res.data);
    } catch (err) {
      console.error("Stats fetch error:", err);
      setStatsError("Failed to load student statistics.");
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => { fetchStudentStats(); }, [fetchStudentStats]);

  const handleStatsBatchFilter = (val) => { setStatsBatchFilter(val); fetchStudentStats(val, statsBranchFilter); };
  const handleStatsBranchFilter = (val) => { setStatsBranchFilter(val); fetchStudentStats(statsBatchFilter, val); };

  const visibleBatches = stats ? stats.batches : [];
  const visibleBranches = stats ? stats.branches : [];

  const filteredStudents = viewedStudents.filter((s) => {
    const matchState = !filterState || s.state?.toLowerCase() === filterState.toLowerCase();
    const matchDistrict = !filterDistrict || s.district?.toLowerCase() === filterDistrict.toLowerCase();
    return matchState && matchDistrict;
  });

  const visibleDistricts = allDistricts.filter(
    (d) => !filterState || viewedStudents.some(
      (s) => s.district === d && s.state?.toLowerCase() === filterState.toLowerCase()
    )
  );

  // ── File handling ────────────────────────────────────────────────────────
  const processFileForPreview = (f) => {
    if (!f) return;
    setError(""); setSuccessMsg(""); setResponseData(null);
    const ext = f.name.split(".").pop().toLowerCase();
    if (!allowedTypes.includes(ext)) {
      Swal.fire("Invalid File", "Only .csv and .xlsx files are allowed.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      let jsonData;
      if (ext === "csv") {
        const result = Papa.parse(e.target.result, { header: true, skipEmptyLines: true });
        jsonData = result.data;
      } else {
        const workbook = XLSX.read(e.target.result, { type: "binary" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        jsonData = XLSX.utils.sheet_to_json(worksheet);
      }
      if (!jsonData.length) { Swal.fire("Empty File", "Uploaded file is empty.", "error"); return; }
      setParsedData(jsonData);
      setFileInfo({ rows: jsonData.length, columns: Object.keys(jsonData[0]).length });
    };
    ext === "csv" ? reader.readAsText(f) : reader.readAsBinaryString(f);
  };

  const handleBranchAdd = () => {
    const nb = customBranch.trim().toUpperCase();
    if (!nb || nb.length < 2) { Swal.fire("Invalid Branch", "Please enter a valid branch name.", "warning"); return; }
    if (branches.includes(nb)) { Swal.fire("Duplicate", "This branch already exists.", "info"); return; }
    setBranches((p) => [...p, nb]); setSelectedBranch(nb); setCustomBranch("");
    Swal.fire("Added!", `Branch ${nb} added successfully.`, "success");
  };

  const handleRoleAdd = () => {
    const nr = customRole.trim();
    if (!nr || nr.length < 2) { Swal.fire("Invalid Role", "Please enter a valid role name.", "warning"); return; }
    if (roles.includes(nr)) { Swal.fire("Duplicate", "This role already exists.", "info"); return; }
    setRoles((p) => [...p, nr]); setSelectedRole(nr); setCustomRole("");
    Swal.fire("Added!", `Role ${nr} added successfully.`, "success");
  };

  const handleAddBatch = () => {
    const year = parseInt(customBatchYear);
    if (!year || year < 2000 || year > 2100) { Swal.fire("Invalid Year", "Please enter a valid start year.", "warning"); return; }
    const nb = `${year}-${year + 4}`;
    if (batchOptions.includes(nb)) { Swal.fire("Duplicate", "This batch already exists.", "info"); return; }
    setCustomBatches((p) => [...p, nb]); setSelectedBatch(nb); setCustomBatchYear("");
    Swal.fire("Added!", `Batch ${nb} added successfully.`, "success");
  };

  const handleDeleteBatch = () => {
    if (!selectedBatch) { Swal.fire("Select Batch", "Please select a batch to delete.", "info"); return; }
    if (!customBatches.includes(selectedBatch)) { Swal.fire("Cannot Delete", "Only custom batches can be deleted.", "warning"); return; }
    Swal.fire({ title: `Delete batch ${selectedBatch}?`, text: "This action cannot be undone!", icon: "warning", showCancelButton: true, confirmButtonText: "Yes, delete it!" })
      .then((r) => { if (r.isConfirmed) { setCustomBatches(customBatches.filter((b) => b !== selectedBatch)); setSelectedBatch(""); Swal.fire("Deleted!", "Batch removed from list.", "success"); } });
  };

  const handleDrop = (e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) { setFile(f); processFileForPreview(f); } };
  const handleFileChange = (e) => { const f = e.target.files?.[0]; if (f) { setFile(f); processFileForPreview(f); } };

  const handleUpload = async () => {
    if (!file || !selectedBatch || selectedBatch === "custom" || !selectedBranch || selectedBranch === "custom" || !selectedRole || selectedRole === "custom") {
      Swal.fire("Missing Info", "Please select a valid batch, branch, role and upload a file.", "warning");
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("batch", selectedBatch);
      formData.append("branch", selectedBranch);
      formData.append("role", selectedRole);
      const response = await axios.post(`${API_BASE_URL}/API_B/admin/upload`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      setSuccessMsg(`Data uploaded successfully! ${response.data.count} rows imported.`);
      setResponseData(response.data);
      Swal.fire("Upload Successful", `${response.data.count} rows imported.`, "success");
      fetchStudentStats(statsBatchFilter, statsBranchFilter);
    } catch (err) {
      Swal.fire("Upload Failed", err.response?.data?.error || err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleViewStudents = async () => {
    if (!selectedBatch || !selectedBranch) { Swal.fire("Missing Info", "Please select both batch and branch to view students.", "warning"); return; }
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/API_B/admin/students/enriched`, { params: { batch: selectedBatch, branch: selectedBranch } });
      if (response.data.length === 0) Swal.fire("No Students", "No students found for this batch and branch.", "info");
      setViewedStudents(response.data);
      setViewedBatch(selectedBatch);
      setViewedBranch(selectedBranch);
      setFilterState(""); setFilterDistrict("");
      const states = [...new Set(response.data.map((s) => s.state).filter((s) => s && s !== "N/A"))].sort();
      const districts = [...new Set(response.data.map((s) => s.district).filter((d) => d && d !== "N/A"))].sort();
      setAllStates(states); setAllDistricts(districts);
    } catch (err) {
      Swal.fire("Error", "Failed to fetch students. Try again later.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!filteredStudents.length) return;
    const exportData = filteredStudents.map((s, i) => ({
      "#": i + 1, "Enrollment No": s.EnrollmentNo, "Student Name": s.StudentName,
      "Email ID": s.EmailId, "Mobile No": s.MobileNo, Batch: s.batch, Branch: s.branch,
      Role: s.role || "N/A", Village: s.village || "N/A", District: s.district || "N/A",
      State: s.state || "N/A", Pincode: s.pincode || "N/A",
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    const fileParts = ["Students", viewedBatch, viewedBranch, filterState || null, filterDistrict || null].filter(Boolean).join("_");
    XLSX.writeFile(wb, `${fileParts}.xlsx`);
  };

  const handleCancel = () => {
    setFile(null); setParsedData(null); setResponseData(null); setViewedStudents([]);
    setSuccessMsg(""); setError(""); setSelectedBatch(""); setSelectedBranch("");
    setSelectedRole(""); setFilterState(""); setFilterDistrict("");
    setAllStates([]); setAllDistricts([]);
    if (inputRef.current) inputRef.current.value = null;
  };

  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const wsData = [["EnrollmentNo", "StudentName", "EmailId", "MobileNo", "Village", "District", "State", "Pincode"]];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Student_Template.xlsx");
  };

  // ── Modal content helpers ────────────────────────────────────────────────
  const modalData = {
    db: {
      title: "Database Records",
      icon: "🗄️",
      accent: "#3b82f6",
      content: stats ? (
        <div className="modal-stats-grid">
          <div className="modal-stat-row">
            <span className="modal-stat-label">Total Students in DB</span>
            <span className="modal-stat-value modal-stat-value--blue">{stats.grandTotal}</span>
          </div>
          <div className="modal-divider" />
          <p className="modal-section-title">Breakdown by Batch & Branch</p>
          <div className="modal-table-wrap">
            <table className="modal-table">
              <thead>
                <tr>
                  <th>Batch</th>
                  {visibleBranches.map(br => <th key={br}>{br}</th>)}
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {visibleBatches.map(batch => (
                  <tr key={batch}>
                    <td className="modal-table__batch">{batch}</td>
                    {visibleBranches.map(br => <td key={br}>{stats.matrix[batch]?.[br] ?? 0}</td>)}
                    <td className="modal-table__total">{stats.batchTotals[batch] ?? 0}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td><strong>Total</strong></td>
                  {visibleBranches.map(br => <td key={br}><strong>{stats.branchTotals[br] ?? 0}</strong></td>)}
                  <td><strong>{stats.grandTotal}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : <p>No data available.</p>
    },
    registered: {
      title: "Registered Users",
      icon: "✅",
      accent: "#22c55e",
      content: stats ? (
        <div className="modal-stats-grid">
          <div className="modal-stat-row">
            <span className="modal-stat-label">Total Registered</span>
            <span className="modal-stat-value modal-stat-value--green">{stats.registeredTotal}</span>
          </div>
          <div className="modal-stat-row">
            <span className="modal-stat-label">Out of Total DB</span>
            <span className="modal-stat-value">{stats.grandTotal}</span>
          </div>
          <div className="modal-stat-row">
            <span className="modal-stat-label">Registration Rate</span>
            <span className="modal-stat-value modal-stat-value--green">
              {stats.grandTotal > 0 ? ((stats.registeredTotal / stats.grandTotal) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <div className="modal-divider" />
          <p className="modal-section-title">Registered by Branch</p>
          <div className="modal-chip-row">
            {visibleBranches.map(br => (
              <div key={br} className="modal-branch-chip modal-branch-chip--green">
                <span className="modal-branch-chip__name">{br}</span>
                <span className="modal-branch-chip__val">{stats.registeredByBranch[br] ?? 0}</span>
                <span className="modal-branch-chip__of">/ {stats.branchTotals[br] ?? 0}</span>
              </div>
            ))}
          </div>
          <div className="modal-progress-list">
            {visibleBranches.map(br => {
              const reg = stats.registeredByBranch[br] ?? 0;
              const total = stats.branchTotals[br] ?? 0;
              const pct = total > 0 ? (reg / total) * 100 : 0;
              return (
                <div key={br} className="modal-progress-item">
                  <div className="modal-progress-label">
                    <span>{br}</span>
                    <span>{reg}/{total}</span>
                  </div>
                  <div className="modal-progress-bar">
                    <div className="modal-progress-fill modal-progress-fill--green" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : <p>No data available.</p>
    },
    pending: {
      title: "Unregistered Students",
      icon: "⏳",
      accent: "#f97316",
      content: stats ? (
        <div className="modal-stats-grid">
          <div className="modal-stat-row">
            <span className="modal-stat-label">Not Yet Registered</span>
            <span className="modal-stat-value modal-stat-value--orange">{stats.grandTotal - stats.registeredTotal}</span>
          </div>
          <div className="modal-stat-row">
            <span className="modal-stat-label">Pending Rate</span>
            <span className="modal-stat-value modal-stat-value--orange">
              {stats.grandTotal > 0 ? (((stats.grandTotal - stats.registeredTotal) / stats.grandTotal) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <div className="modal-divider" />
          <p className="modal-section-title">Pending by Branch</p>
          <div className="modal-progress-list">
            {visibleBranches.map(br => {
              const reg = stats.registeredByBranch[br] ?? 0;
              const total = stats.branchTotals[br] ?? 0;
              const pending = total - reg;
              const pct = total > 0 ? (pending / total) * 100 : 0;
              return (
                <div key={br} className="modal-progress-item">
                  <div className="modal-progress-label">
                    <span>{br}</span>
                    <span className="modal-progress-label__pending">{pending} pending</span>
                  </div>
                  <div className="modal-progress-bar">
                    <div className="modal-progress-fill modal-progress-fill--orange" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : <p>No data available.</p>
    },
    platform: {
      title: "Platform Users",
      icon: "👥",
      accent: "#8b5cf6",
      content: stats ? (
        <div className="modal-stats-grid">
          <div className="modal-stat-row">
            <span className="modal-stat-label">Total Platform Accounts</span>
            <span className="modal-stat-value modal-stat-value--purple">{stats.userRoleStats.total}</span>
          </div>
          <div className="modal-divider" />
          <p className="modal-section-title">By Role</p>
          {[
            { role: "Students", count: stats.userRoleStats.student, color: "blue", icon: "🎓" },
            { role: "Alumni", count: stats.userRoleStats.alumni, color: "green", icon: "🏆" },
            { role: "Faculty", count: stats.userRoleStats.faculty, color: "purple", icon: "👨‍🏫" },
          ].map(({ role, count, color, icon }) => (
            <div key={role} className={`modal-role-card modal-role-card--${color}`}>
              <span className="modal-role-icon">{icon}</span>
              <div className="modal-role-info">
                <span className="modal-role-name">{role}</span>
                <span className="modal-role-count">{count} accounts</span>
              </div>
              <div className="modal-role-bar-wrap">
                <div className="modal-role-bar">
                  <div
                    className={`modal-role-bar-fill modal-role-bar-fill--${color}`}
                    style={{ width: `${stats.userRoleStats.total > 0 ? (count / stats.userRoleStats.total) * 100 : 0}%` }}
                  />
                </div>
                <span className="modal-role-pct">
                  {stats.userRoleStats.total > 0 ? ((count / stats.userRoleStats.total) * 100).toFixed(0) : 0}%
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : <p>No data available.</p>
    },
    students: {
      title: "Student Accounts",
      icon: "🎓",
      accent: "#3b82f6",
      content: stats ? (
        <div className="modal-stats-grid">
          <div className="modal-stat-row">
            <span className="modal-stat-label">Students with Accounts</span>
            <span className="modal-stat-value modal-stat-value--blue">{stats.userRoleStats.student}</span>
          </div>
          <div className="modal-stat-row">
            <span className="modal-stat-label">% of Total Users</span>
            <span className="modal-stat-value modal-stat-value--blue">
              {stats.userRoleStats.total > 0 ? ((stats.userRoleStats.student / stats.userRoleStats.total) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <div className="modal-info-box">
            <span>👆 These are students who have created an account on the portal. Use the upload form below to add more students to the database.</span>
          </div>
        </div>
      ) : <p>No data available.</p>
    },
    alumni: {
      title: "Alumni Accounts",
      icon: "🏆",
      accent: "#22c55e",
      content: stats ? (
        <div className="modal-stats-grid">
          <div className="modal-stat-row">
            <span className="modal-stat-label">Alumni with Accounts</span>
            <span className="modal-stat-value modal-stat-value--green">{stats.userRoleStats.alumni}</span>
          </div>
          <div className="modal-stat-row">
            <span className="modal-stat-label">% of Total Users</span>
            <span className="modal-stat-value modal-stat-value--green">
              {stats.userRoleStats.total > 0 ? ((stats.userRoleStats.alumni / stats.userRoleStats.total) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <div className="modal-info-box modal-info-box--green">
            <span>🏆 Alumni are graduates who stay connected through the portal for networking and mentorship opportunities.</span>
          </div>
        </div>
      ) : <p>No data available.</p>
    },
    faculty: {
      title: "Faculty Accounts",
      icon: "👨‍🏫",
      accent: "#8b5cf6",
      content: stats ? (
        <div className="modal-stats-grid">
          <div className="modal-stat-row">
            <span className="modal-stat-label">Faculty Members</span>
            <span className="modal-stat-value modal-stat-value--purple">{stats.userRoleStats.faculty}</span>
          </div>
          <div className="modal-stat-row">
            <span className="modal-stat-label">% of Total Users</span>
            <span className="modal-stat-value modal-stat-value--purple">
              {stats.userRoleStats.total > 0 ? ((stats.userRoleStats.faculty / stats.userRoleStats.total) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <div className="modal-info-box modal-info-box--purple">
            <span>👨‍🏫 Faculty members have administrative access to manage student records and alumni updates.</span>
          </div>
        </div>
      ) : <p>No data available.</p>
    },
    matrixCell: null,
  };

  return (
    <div className="batches-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header__icon">📦</div>
        <div>
          <h2 className="page-header__title">Batch Upload</h2>
          <p className="page-header__sub">Manage student batches and track registration statistics</p>
        </div>
      </div>

      {/* ══ STATS PANEL ══════════════════════════════════════════════════════ */}
      <div className="stats-section">
        <div className="stats-header">
          <div className="stats-header__left">
            <h3 className="stats-title">
              <span className="stats-title__icon">📊</span>
              Student Statistics
            </h3>
            <span className="stats-hint">Click any card to explore details</span>
          </div>
          <button
            className="stats-refresh-btn"
            onClick={() => fetchStudentStats(statsBatchFilter, statsBranchFilter)}
            disabled={statsLoading}
          >
            <span className={statsLoading ? "spin" : ""}>⟳</span> {statsLoading ? "Loading…" : "Refresh"}
          </button>
        </div>

        {statsError && <p className="stats-error">⚠ {statsError}</p>}

        {stats && !statsLoading && (
          <>
            {/* ── Top summary cards ─────────────────────────────────────── */}
            <div className="stats-summary">
              <StatCard label="In Database" value={stats.grandTotal} sub="student records" icon="🗄️" color="db" accent="#3b82f6" onClick={() => setActiveModal("db")} />
              <StatCard label="Registered" value={stats.registeredTotal} sub="have an account" icon="✅" color="registered" accent="#22c55e" onClick={() => setActiveModal("registered")} />
              <StatCard label="Not Registered" value={stats.grandTotal - stats.registeredTotal} sub="no account yet" icon="⏳" color="pending" accent="#f97316" onClick={() => setActiveModal("pending")} />

              <div className="stats-card-divider" />

              <StatCard label="Platform Users" value={stats.userRoleStats.total} sub="total accounts" icon="👥" color="platform" accent="#8b5cf6" onClick={() => setActiveModal("platform")} />
              <StatCard label="Students" value={stats.userRoleStats.student} sub="role: student" icon="🎓" color="student" accent="#3b82f6" onClick={() => setActiveModal("students")} />
              <StatCard label="Alumni" value={stats.userRoleStats.alumni} sub="role: alumni" icon="🏆" color="alumni" accent="#22c55e" onClick={() => setActiveModal("alumni")} />
              <StatCard label="Faculty" value={stats.userRoleStats.faculty} sub="role: faculty" icon="👨‍🏫" color="faculty" accent="#8b5cf6" onClick={() => setActiveModal("faculty")} />
            </div>

            {/* ── Stats filter row ──────────────────────────────────────── */}
            <div className="stats-filter-row">
              <div className="stats-filter-group">
                <label>Filter Batch</label>
                <select value={statsBatchFilter} onChange={(e) => handleStatsBatchFilter(e.target.value)}>
                  <option value="">All Batches</option>
                  {generateBatches().map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="stats-filter-group">
                <label>Filter Branch</label>
                <select value={statsBranchFilter} onChange={(e) => handleStatsBranchFilter(e.target.value)}>
                  <option value="">All Branches</option>
                  {(stats.branches.length ? stats.branches : ["CSE", "ECE", "ME", "CE"]).map((br) => (
                    <option key={br} value={br}>{br}</option>
                  ))}
                </select>
              </div>
              {(statsBatchFilter || statsBranchFilter) && (
                <button className="stats-clear-btn" onClick={() => { setStatsBatchFilter(""); setStatsBranchFilter(""); fetchStudentStats("", ""); }}>
                  ✕ Clear filters
                </button>
              )}
            </div>

            {/* ── Matrix table ──────────────────────────────────────────── */}
            {visibleBatches.length > 0 ? (
              <div className="stats-table-wrapper">
                <table className="stats-table">
                  <thead>
                    <tr>
                      <th className="stats-table__corner">Batch</th>
                      {visibleBranches.map((br) => <th key={br}>{br}</th>)}
                      <th className="stats-table__total-col">Total (DB)</th>
                      <th className="stats-table__reg-col">Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleBatches.map((batch) => (
                      <tr key={batch}>
                        <td className="stats-table__batch-cell">{batch}</td>
                        {visibleBranches.map((br) => (
                          <td
                            key={br}
                            className="stats-table__count-cell stats-table__count-cell--clickable"
                            onClick={() => setActiveModal({ type: "cell", batch, branch: br, count: stats.matrix[batch]?.[br] ?? 0 })}
                            title={`View details: ${batch} · ${br}`}
                          >
                            {stats.matrix[batch]?.[br] ?? 0}
                          </td>
                        ))}
                        <td className="stats-table__total-cell">{stats.batchTotals[batch] ?? 0}</td>
                        <td className="stats-table__reg-cell">
                          {visibleBatches.length === 1 ? stats.registeredTotal : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {visibleBatches.length > 1 && (
                    <tfoot>
                      <tr>
                        <td className="stats-table__batch-cell"><strong>Total</strong></td>
                        {visibleBranches.map((br) => (
                          <td key={br} className="stats-table__count-cell stats-table__footer-cell">
                            <strong>{stats.branchTotals[br] ?? 0}</strong>
                          </td>
                        ))}
                        <td className="stats-table__total-cell stats-table__footer-cell"><strong>{stats.grandTotal}</strong></td>
                        <td className="stats-table__reg-cell stats-table__footer-cell"><strong>{stats.registeredTotal}</strong></td>
                      </tr>
                    </tfoot>
                  )}
                </table>

                <div className="stats-registered-row">
                  <span className="stats-registered-label">Registered by branch:</span>
                  {visibleBranches.map((br) => (
                    <span
                      key={br}
                      className="stats-registered-chip"
                      onClick={() => setActiveModal("registered")}
                      title="Click to view registration details"
                    >
                      <strong>{br}</strong>: {stats.registeredByBranch[br] ?? 0}
                      &nbsp;<span className="stats-registered-chip__of">/ {stats.branchTotals[br] ?? 0}</span>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="stats-empty">No data found for the selected filters.</p>
            )}
          </>
        )}

        {statsLoading && (
          <div className="stats-loading">
            <div className="spinner" />
            <span>Fetching statistics…</span>
          </div>
        )}
      </div>

      {/* ══ UPLOAD SECTION ═══════════════════════════════════════════════════ */}
      <div className="upload-section">
        <div className="upload-section__header">
          <h3 className="upload-section__title">
            <span>📤</span> Upload Student Data
          </h3>
          <p className="upload-section__sub">Select role, batch, and branch before uploading a CSV or XLSX file</p>
        </div>

        <div className="upload-form-grid">
          <div className="form-group">
            <label className="form-label">Select Role</label>
            <select className="form-select" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} disabled={loading}>
              <option value="">-- Select Role --</option>
              {roles.map((r) => <option key={r} value={r}>{r}</option>)}
              <option value="custom">+ Add Custom Role</option>
            </select>
            {selectedRole === "custom" && (
              <div className="custom-inline">
                <input type="text" placeholder="Enter new role name" value={customRole} onChange={(e) => setCustomRole(e.target.value)} disabled={loading} />
                <button onClick={handleRoleAdd} disabled={loading || !customRole}>Add</button>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Select Batch</label>
            <select className="form-select" value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} disabled={loading}>
              <option value="">-- Select Batch --</option>
              {batchOptions.map((b) => <option key={b} value={b}>{b}</option>)}
              <option value="custom">+ Add Custom Batch</option>
            </select>
            {selectedBatch === "custom" && (
              <div className="custom-inline">
                <input type="number" placeholder="Enter start year (e.g. 2021)" value={customBatchYear} onChange={(e) => setCustomBatchYear(e.target.value)} disabled={loading} />
                <button onClick={handleAddBatch} disabled={loading || !customBatchYear}>Add</button>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Select Branch</label>
            <select className="form-select" value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)} disabled={loading}>
              <option value="">-- Select Branch --</option>
              {branches.map((b) => <option key={b} value={b}>{b}</option>)}
              <option value="custom">+ Add Custom Branch</option>
            </select>
            {selectedBranch === "custom" && (
              <div className="custom-inline">
                <input type="text" placeholder="Enter new branch name" value={customBranch} onChange={(e) => setCustomBranch(e.target.value)} disabled={loading} />
                <button onClick={handleBranchAdd} disabled={loading || !customBranch}>Add</button>
              </div>
            )}
          </div>
        </div>

        <div
          className={`drop-area ${file ? "drop-area--has-file" : ""}`}
          onClick={() => inputRef.current.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {file ? (
            <div className="drop-area__file-info">
              <span className="drop-area__file-icon">📄</span>
              <div>
                <p className="drop-area__file-name">{file.name}</p>
                <p className="drop-area__file-meta">{fileInfo.rows} rows · {fileInfo.columns} columns · Click to replace</p>
              </div>
            </div>
          ) : (
            <>
              <span className="drop-area__icon">☁️</span>
              <p className="drop-area__text">Drag & drop file here or <span>click to select</span></p>
              <p className="drop-area__hint">Accepts .csv and .xlsx files</p>
            </>
          )}
          <input type="file" ref={inputRef} accept=".csv,.xlsx" onChange={handleFileChange} disabled={loading} />
        </div>

        {parsedData && parsedData.length > 0 && (
          <div className="preview-panel">
            <div className="preview-panel__header">
              <span className="preview-panel__badge">✅ Preview — {fileInfo.rows} rows, {fileInfo.columns} columns</span>
              <span className="preview-panel__note">Showing first 5 rows</span>
            </div>
            <div className="preview-table">
              <table>
                <thead><tr>{Object.keys(parsedData[0]).map((k) => <th key={k}>{k}</th>)}</tr></thead>
                <tbody>{parsedData.slice(0, 5).map((row, i) => <tr key={i}>{Object.values(row).map((v, j) => <td key={j}>{v}</td>)}</tr>)}</tbody>
              </table>
            </div>
          </div>
        )}

        {responseData && (
          <div className="response-details">
            <h3>✅ Upload Results</h3>
            <p>Total Rows Uploaded: <strong>{responseData.count}</strong></p>
            {(responseData.duplicateRows?.length > 0 || responseData.invalidRows?.length > 0) && (
              <div className="non-imported-rows">
                <h4>Issues Detected ({(responseData.duplicateRows?.length || 0) + (responseData.invalidRows?.length || 0)}):</h4>
                <ul>
                  {responseData.duplicateRows?.map((row, i) => <li key={`d-${i}`}>{row.row.StudentName}: {row.reason} (Row {row.rowIndex})</li>)}
                  {responseData.invalidRows?.map((row, i) => <li key={`iv-${i}`}>{row.row.StudentName}: {row.reason} (Row {row.rowIndex})</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="btn-row">
          <button className="btn btn--upload" onClick={handleUpload}
            disabled={!file || !selectedBatch || selectedBatch === "custom" || !selectedBranch || selectedBranch === "custom" || !selectedRole || selectedRole === "custom" || loading}>
            {loading ? <><span className="spin">⟳</span> Uploading…</> : "⬆ Upload"}
          </button>
          <button onClick={handleDownloadTemplate} className="btn btn--template" disabled={loading}>📋 Template</button>
          <button className="btn btn--view" onClick={handleViewStudents}
            disabled={!selectedBatch || selectedBatch === "custom" || !selectedBranch || selectedBranch === "custom" || loading}>
            👁 View Students
          </button>
          <button className="btn btn--delete" onClick={handleDeleteBatch} disabled={!customBatches.includes(selectedBatch) || loading}>
            🗑 Delete Batch
          </button>
          <button
            className={`btn btn--cancel ${selectedBatch || selectedBranch || selectedRole ? "" : "btn--disabled"}`}
            onClick={handleCancel}
            disabled={!selectedBatch && !selectedBranch && !selectedRole}
          >
            ✕ Cancel
          </button>
        </div>

        {loading && (
          <div className="stats-loading">
            <div className="spinner" />
            <span>Processing…</span>
          </div>
        )}
      </div>

      {/* ── Viewed students table ──────────────────────────────────────────── */}
      {viewedStudents.length > 0 && (
        <div className="students-section">
          <div className="table-controls">
            <h3>
              Students — {viewedBatch} · {viewedBranch}&nbsp;
              <span className="count-badge">{filteredStudents.length} / {viewedStudents.length}</span>
            </h3>
            <div className="filters">
              <select value={filterState} onChange={(e) => { setFilterState(e.target.value); setFilterDistrict(""); }}>
                <option value="">All States</option>
                {allStates.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)} disabled={!filterState && allDistricts.length === 0}>
                <option value="">All Districts</option>
                {visibleDistricts.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <button className="btn btn--export" onClick={handleExport} disabled={!filteredStudents.length}>⬇ Export Excel</button>
            </div>
          </div>
          <div className="preview-table">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Enrollment No</th><th>Student Name</th><th>Email ID</th>
                  <th>Mobile No</th><th>Batch</th><th>Branch</th><th>Role</th>
                  <th>Village</th><th>District</th><th>State</th><th>Pincode</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s, i) => (
                  <tr key={s._id}>
                    <td>{i + 1}</td><td>{s.EnrollmentNo}</td><td>{s.StudentName}</td>
                    <td>{s.EmailId}</td><td>{s.MobileNo}</td><td>{s.batch}</td>
                    <td>{s.branch}</td><td>{s.role || "N/A"}</td>
                    <td>{s.village || "N/A"}</td><td>{s.district || "N/A"}</td>
                    <td>{s.state || "N/A"}</td><td>{s.pincode || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredStudents.length === 0 && <p className="no-results">No students match the selected filters.</p>}
          </div>
        </div>
      )}

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      {typeof activeModal === "string" && modalData[activeModal] && (
        <Modal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          title={modalData[activeModal].title}
          icon={modalData[activeModal].icon}
          accentColor={modalData[activeModal].accent}
        >
          {modalData[activeModal].content}
        </Modal>
      )}

      {/* Cell modal for matrix table clicks */}
      {activeModal && typeof activeModal === "object" && activeModal.type === "cell" && (
        <Modal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          title={`${activeModal.batch} · ${activeModal.branch}`}
          icon="📊"
          accentColor="#3b82f6"
        >
          <div className="modal-stats-grid">
            <div className="modal-stat-row">
              <span className="modal-stat-label">Total Students</span>
              <span className="modal-stat-value modal-stat-value--blue">{activeModal.count}</span>
            </div>
            <div className="modal-stat-row">
              <span className="modal-stat-label">Batch</span>
              <span className="modal-stat-value">{activeModal.batch}</span>
            </div>
            <div className="modal-stat-row">
              <span className="modal-stat-label">Branch</span>
              <span className="modal-stat-value">{activeModal.branch}</span>
            </div>
            {stats && (
              <div className="modal-stat-row">
                <span className="modal-stat-label">Registered (Branch Total)</span>
                <span className="modal-stat-value modal-stat-value--green">
                  {stats.registeredByBranch[activeModal.branch] ?? 0}
                </span>
              </div>
            )}
            <div className="modal-info-box">
              <span>💡 Use the upload form to add more students to this batch and branch combination.</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Batches;