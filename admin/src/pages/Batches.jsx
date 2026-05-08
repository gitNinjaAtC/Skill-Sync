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
  // Active filters for the stats panel (independent of upload form)
  const [statsBatchFilter, setStatsBatchFilter] = useState("");
  const [statsBranchFilter, setStatsBranchFilter] = useState("");

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

  useEffect(() => {
    fetchStudentStats();
  }, [fetchStudentStats]);

  // Re-fetch when stats filters change
  const handleStatsBatchFilter = (val) => {
    setStatsBatchFilter(val);
    fetchStudentStats(val, statsBranchFilter);
  };
  const handleStatsBranchFilter = (val) => {
    setStatsBranchFilter(val);
    fetchStudentStats(statsBatchFilter, val);
  };

  // ── Derived data ─────────────────────────────────────────────────────────
  // Batches/branches visible in the stats table depend on what the API returned
  const visibleBatches = stats ? stats.batches : [];
  const visibleBranches = stats ? stats.branches : [];

  const filteredStudents = viewedStudents.filter((s) => {
    const matchState = !filterState || s.state?.toLowerCase() === filterState.toLowerCase();
    const matchDistrict = !filterDistrict || s.district?.toLowerCase() === filterDistrict.toLowerCase();
    return matchState && matchDistrict;
  });

  const visibleDistricts = allDistricts.filter(
    (d) =>
      !filterState ||
      viewedStudents.some(
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

  // ── Branch / Role / Batch helpers ─────────────────────────────────────────
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

  // ── Upload ────────────────────────────────────────────────────────────────
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
      // Refresh stats after upload (respect current stats filters)
      fetchStudentStats(statsBatchFilter, statsBranchFilter);
    } catch (err) {
      Swal.fire("Upload Failed", err.response?.data?.error || err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // ── View Students ─────────────────────────────────────────────────────────
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

  // ── Export ────────────────────────────────────────────────────────────────
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

  // ── Cancel ────────────────────────────────────────────────────────────────
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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="batches-page">
      <h2 className="center-heading">Batch Upload Page</h2>

      {/* ══ STATS PANEL ══════════════════════════════════════════════════════ */}
      <div className="stats-section">
        <div className="stats-header">
          <h3 className="stats-title">📊 Student Statistics</h3>
          <button
            className="stats-refresh-btn"
            onClick={() => fetchStudentStats(statsBatchFilter, statsBranchFilter)}
            disabled={statsLoading}
          >
            {statsLoading ? "⟳ Loading…" : "⟳ Refresh"}
          </button>
        </div>

        {statsError && <p className="stats-error">{statsError}</p>}

        {stats && !statsLoading && (
          <>
            {/* ── Top summary cards ───────────────────────────────────────── */}
            <div className="stats-summary">
              {/* Students in DB */}
              <div className="stats-card stats-card--db">
                <span className="stats-card__label">In Database</span>
                <span className="stats-card__value">{stats.grandTotal}</span>
                <span className="stats-card__sub">student records</span>
              </div>

              {/* Registered users */}
              <div className="stats-card stats-card--registered">
                <span className="stats-card__label">Registered</span>
                <span className="stats-card__value">{stats.registeredTotal}</span>
                <span className="stats-card__sub">have an account</span>
              </div>

              {/* Not registered yet */}
              <div className="stats-card stats-card--pending">
                <span className="stats-card__label">Not Registered</span>
                <span className="stats-card__value">
                  {stats.grandTotal - stats.registeredTotal}
                </span>
                <span className="stats-card__sub">no account yet</span>
              </div>

              {/* Divider */}
              <div className="stats-card-divider" />

              {/* Platform user role breakdown */}
              <div className="stats-card stats-card--platform">
                <span className="stats-card__label">Platform Users</span>
                <span className="stats-card__value">{stats.userRoleStats.total}</span>
                <span className="stats-card__sub">total accounts</span>
              </div>
              <div className="stats-card">
                <span className="stats-card__label">Students</span>
                <span className="stats-card__value">{stats.userRoleStats.student}</span>
                <span className="stats-card__sub">role: student</span>
              </div>
              <div className="stats-card">
                <span className="stats-card__label">Alumni</span>
                <span className="stats-card__value">{stats.userRoleStats.alumni}</span>
                <span className="stats-card__sub">role: alumni</span>
              </div>
              <div className="stats-card">
                <span className="stats-card__label">Faculty</span>
                <span className="stats-card__value">{stats.userRoleStats.faculty}</span>
                <span className="stats-card__sub">role: faculty</span>
              </div>
            </div>

            {/* ── Stats filter row (batch + branch) ───────────────────────── */}
            <div className="stats-filter-row">
              <div className="stats-filter-group">
                <label>Filter Batch:</label>
                <select
                  value={statsBatchFilter}
                  onChange={(e) => handleStatsBatchFilter(e.target.value)}
                >
                  <option value="">All Batches</option>
                  {generateBatches().map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="stats-filter-group">
                <label>Filter Branch:</label>
                <select
                  value={statsBranchFilter}
                  onChange={(e) => handleStatsBranchFilter(e.target.value)}
                >
                  <option value="">All Branches</option>
                  {/* Show branches from current (unfiltered) stats OR a static fallback */}
                  {(stats.branches.length ? stats.branches : ["CSE", "ECE", "ME", "CE"]).map((br) => (
                    <option key={br} value={br}>{br}</option>
                  ))}
                </select>
              </div>

              {(statsBatchFilter || statsBranchFilter) && (
                <button
                  className="stats-clear-btn"
                  onClick={() => { setStatsBatchFilter(""); setStatsBranchFilter(""); fetchStudentStats("", ""); }}
                >
                  ✕ Clear filters
                </button>
              )}
            </div>

            {/* ── Matrix table: batches × branches ────────────────────────── */}
            {visibleBatches.length > 0 ? (
              <div className="stats-table-wrapper">
                <table className="stats-table">
                  <thead>
                    <tr>
                      <th className="stats-table__corner">Batch</th>
                      {visibleBranches.map((br) => (
                        <th key={br}>{br}</th>
                      ))}
                      <th className="stats-table__total-col">Total (DB)</th>
                      <th className="stats-table__reg-col">Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleBatches.map((batch) => {
                      // registered count for this batch = sum of registered per branch in this batch
                      // We don't have per-batch registered from backend, so we show "—" when filtered to all batches
                      // but when filtered to a single batch the registeredTotal is for that batch
                      return (
                        <tr key={batch}>
                          <td className="stats-table__batch-cell">{batch}</td>
                          {visibleBranches.map((br) => (
                            <td key={br} className="stats-table__count-cell">
                              {stats.matrix[batch]?.[br] ?? 0}
                            </td>
                          ))}
                          <td className="stats-table__total-cell">
                            {stats.batchTotals[batch] ?? 0}
                          </td>
                          <td className="stats-table__reg-cell">
                            {/* only meaningful when one batch is selected */}
                            {visibleBatches.length === 1 ? stats.registeredTotal : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {/* Footer totals — only shown when NOT filtered to a single batch */}
                  {visibleBatches.length > 1 && (
                    <tfoot>
                      <tr>
                        <td className="stats-table__batch-cell"><strong>Total</strong></td>
                        {visibleBranches.map((br) => (
                          <td key={br} className="stats-table__count-cell stats-table__footer-cell">
                            <strong>{stats.branchTotals[br] ?? 0}</strong>
                          </td>
                        ))}
                        <td className="stats-table__total-cell stats-table__footer-cell">
                          <strong>{stats.grandTotal}</strong>
                        </td>
                        <td className="stats-table__reg-cell stats-table__footer-cell">
                          <strong>{stats.registeredTotal}</strong>
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>

                {/* Per-branch registered breakdown below table */}
                <div className="stats-registered-row">
                  <span className="stats-registered-label">Registered by branch:</span>
                  {visibleBranches.map((br) => (
                    <span key={br} className="stats-registered-chip">
                      <strong>{br}</strong>: {stats.registeredByBranch[br] ?? 0}
                      &nbsp;<span className="stats-registered-chip__of">
                        / {stats.branchTotals[br] ?? 0}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="stats-empty">No data found for the selected filters.</p>
            )}
          </>
        )}

        {statsLoading && <div className="spinner" />}
      </div>

      <hr />

      {/* ══ UPLOAD FORM ══════════════════════════════════════════════════════ */}

      <label>Select Role:</label>
      <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} disabled={loading}>
        <option value="">-- Select Role --</option>
        {roles.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>

      <label>Select Batch:</label>
      <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} disabled={loading}>
        <option value="">-- Select Batch --</option>
        {batchOptions.map((b) => <option key={b} value={b}>{b}</option>)}
        <option value="custom">+ Add Custom Batch</option>
      </select>

      {selectedBatch === "custom" && (
        <div className="custom-batch">
          <input type="number" placeholder="Enter start year (e.g. 2021)" value={customBatchYear} onChange={(e) => setCustomBatchYear(e.target.value)} disabled={loading} />
          <button onClick={handleAddBatch} disabled={loading || !customBatchYear}>Add</button>
        </div>
      )}

      <label>Select Branch:</label>
      <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)} disabled={loading}>
        <option value="">-- Select Branch --</option>
        {branches.map((b) => <option key={b} value={b}>{b}</option>)}
        <option value="custom">+ Add Custom Branch</option>
      </select>

      {selectedBranch === "custom" && (
        <div className="custom-branch">
          <input type="text" placeholder="Enter new branch name" value={customBranch} onChange={(e) => setCustomBranch(e.target.value)} disabled={loading} />
          <button onClick={handleBranchAdd} disabled={loading || !customBranch}>Add</button>
        </div>
      )}

      <div className="drop-area" onClick={() => inputRef.current.click()} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
        Drag & drop file here or click to select
        <input type="file" ref={inputRef} accept=".csv,.xlsx" onChange={handleFileChange} disabled={loading} />
      </div>

      {parsedData && parsedData.length > 0 && (
        <>
          <hr />
          <div className="file-stats">✅ Rows: {fileInfo.rows} | Columns: {fileInfo.columns}</div>
          <div className="preview-table">
            <table>
              <thead><tr>{Object.keys(parsedData[0]).map((k) => <th key={k}>{k}</th>)}</tr></thead>
              <tbody>{parsedData.slice(0, 5).map((row, i) => <tr key={i}>{Object.values(row).map((v, j) => <td key={j}>{v}</td>)}</tr>)}</tbody>
            </table>
            <p>Showing first 5 rows…</p>
          </div>
        </>
      )}

      {responseData && (
        <div className="response-details">
          <h3>Upload Results</h3>
          <p>Total Rows Uploaded: {responseData.count}</p>
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
        <button className="submit-btn" onClick={handleUpload}
          disabled={!file || !selectedBatch || selectedBatch === "custom" || !selectedBranch || selectedBranch === "custom" || !selectedRole || selectedRole === "custom" || loading}>
          {loading ? "Uploading…" : "Upload"}
        </button>
        <button onClick={handleDownloadTemplate} className="preview-btn" disabled={loading}>Template</button>
        <button className="view-btn" onClick={handleViewStudents}
          disabled={!selectedBatch || selectedBatch === "custom" || !selectedBranch || selectedBranch === "custom" || loading}>
          View Students
        </button>
        <button className="delete-btn" onClick={handleDeleteBatch} disabled={!customBatches.includes(selectedBatch) || loading}>Delete Batch</button>
        <button className={`cancel-btn ${selectedBatch || selectedBranch || selectedRole ? "active" : "disabled"}`}
          onClick={handleCancel} disabled={!selectedBatch && !selectedBranch && !selectedRole}>
          Cancel
        </button>
      </div>

      {loading && <div className="spinner" />}

      {/* ── Viewed students table ─────────────────────────────────────────── */}
      {viewedStudents.length > 0 && (
        <div className="preview-table">
          <div className="table-controls">
            <h3>
              Students in {viewedBatch} – {viewedBranch}&nbsp;
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
              <button className="export-btn" onClick={handleExport} disabled={!filteredStudents.length}>⬇ Export Excel</button>
            </div>
          </div>
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
      )}
    </div>
  );
};

export default Batches;