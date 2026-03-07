import React, { useState, useRef } from "react";
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
    if (end <= currentYear + 4) {
      batches.push(`${year}-${end}`);
    }
  }
  return batches;
};

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8800"
    : "https://skill-sync-backend-522o.onrender.com";

const Batches = () => {
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
  const [viewedStudents, setViewedStudents] = useState([]);
  const [viewedBatch, setViewedBatch] = useState("");
  const [viewedBranch, setViewedBranch] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [allStates, setAllStates] = useState([]);
  const [allDistricts, setAllDistricts] = useState([]);
  const inputRef = useRef();

  const allowedTypes = ["csv", "xlsx"];
  const defaultBatches = generateBatches();
  const batchOptions = [...defaultBatches, ...customBatches];

  // ─── Computed filtered list ───────────────────────────────────────────────
  const filteredStudents = viewedStudents.filter((s) => {
    const matchState =
      !filterState ||
      s.state?.toLowerCase() === filterState.toLowerCase();
    const matchDistrict =
      !filterDistrict ||
      s.district?.toLowerCase() === filterDistrict.toLowerCase();
    return matchState && matchDistrict;
  });

  // Districts shown in dropdown are narrowed when a state is selected
  const visibleDistricts = allDistricts.filter(
    (d) =>
      !filterState ||
      viewedStudents.some(
        (s) =>
          s.district === d &&
          s.state?.toLowerCase() === filterState.toLowerCase()
      )
  );

  // ─── File processing ──────────────────────────────────────────────────────
  const processFileForPreview = (file) => {
    if (!file) return;
    setError("");
    setSuccessMsg("");
    setResponseData(null);

    const ext = file.name.split(".").pop().toLowerCase();
    if (!allowedTypes.includes(ext)) {
      Swal.fire("Invalid File", "Only .csv and .xlsx files are allowed.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      let jsonData;
      if (ext === "csv") {
        const result = Papa.parse(e.target.result, {
          header: true,
          skipEmptyLines: true,
        });
        jsonData = result.data;
      } else {
        const workbook = XLSX.read(e.target.result, { type: "binary" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        jsonData = XLSX.utils.sheet_to_json(worksheet);
      }

      if (!jsonData.length) {
        Swal.fire("Empty File", "Uploaded file is empty.", "error");
        return;
      }

      setParsedData(jsonData);
      setFileInfo({
        rows: jsonData.length,
        columns: Object.keys(jsonData[0]).length,
      });
    };

    if (ext === "csv") {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  // ─── Branch / Role / Batch helpers ───────────────────────────────────────
  const handleBranchAdd = () => {
    const newBranch = customBranch.trim().toUpperCase();
    if (!newBranch || newBranch.length < 2) {
      Swal.fire("Invalid Branch", "Please enter a valid branch name.", "warning");
      return;
    }
    if (branches.includes(newBranch)) {
      Swal.fire("Duplicate", "This branch already exists.", "info");
      return;
    }
    setBranches((prev) => [...prev, newBranch]);
    setSelectedBranch(newBranch);
    setCustomBranch("");
    Swal.fire("Added!", `Branch ${newBranch} added successfully.`, "success");
  };

  const handleRoleAdd = () => {
    const newRole = customRole.trim();
    if (!newRole || newRole.length < 2) {
      Swal.fire("Invalid Role", "Please enter a valid role name.", "warning");
      return;
    }
    if (roles.includes(newRole)) {
      Swal.fire("Duplicate", "This role already exists.", "info");
      return;
    }
    setRoles((prev) => [...prev, newRole]);
    setSelectedRole(newRole);
    setCustomRole("");
    Swal.fire("Added!", `Role ${newRole} added successfully.`, "success");
  };

  const handleAddBatch = () => {
    const year = parseInt(customBatchYear);
    if (!year || year < 2000 || year > 2100) {
      Swal.fire("Invalid Year", "Please enter a valid start year.", "warning");
      return;
    }
    const newBatch = `${year}-${year + 4}`;
    if (batchOptions.includes(newBatch)) {
      Swal.fire("Duplicate", "This batch already exists.", "info");
      return;
    }
    setCustomBatches((prev) => [...prev, newBatch]);
    setSelectedBatch(newBatch);
    setCustomBatchYear("");
    Swal.fire("Added!", `Batch ${newBatch} added successfully.`, "success");
  };

  const handleDeleteBatch = () => {
    if (!selectedBatch) {
      Swal.fire("Select Batch", "Please select a batch to delete.", "info");
      return;
    }
    if (!customBatches.includes(selectedBatch)) {
      Swal.fire("Cannot Delete", "Only custom batches can be deleted.", "warning");
      return;
    }
    Swal.fire({
      title: `Delete batch ${selectedBatch}?`,
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setCustomBatches(customBatches.filter((b) => b !== selectedBatch));
        setSelectedBatch("");
        Swal.fire("Deleted!", "Batch removed from list.", "success");
      }
    });
  };

  // ─── File drag/drop ───────────────────────────────────────────────────────
  const handleDrop = (e) => {
    e.preventDefault();
    const selectedFile = e.dataTransfer.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      processFileForPreview(selectedFile);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      processFileForPreview(selectedFile);
    }
  };

  // ─── Upload ───────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (
      !file ||
      !selectedBatch ||
      selectedBatch === "custom" ||
      !selectedBranch ||
      selectedBranch === "custom" ||
      !selectedRole ||
      selectedRole === "custom"
    ) {
      Swal.fire(
        "Missing Info",
        "Please select a valid batch, branch, role and upload a file.",
        "warning"
      );
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("batch", selectedBatch);
      formData.append("branch", selectedBranch);
      formData.append("role", selectedRole);

      const response = await axios.post(
        `${API_BASE_URL}/API_B/admin/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setSuccessMsg(`Data uploaded successfully! ${response.data.count} rows imported.`);
      setResponseData(response.data);
      Swal.fire("Upload Successful", `${response.data.count} rows imported.`, "success");
    } catch (err) {
      console.error("Upload error:", err.response?.data, err.message);
      Swal.fire("Upload Failed", err.response?.data?.error || err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // ─── View Students (enriched with address) ────────────────────────────────
  const handleViewStudents = async () => {
    if (!selectedBatch || !selectedBranch) {
      Swal.fire(
        "Missing Info",
        "Please select both batch and branch to view students.",
        "warning"
      );
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/API_B/admin/students/enriched`,
        { params: { batch: selectedBatch, branch: selectedBranch } }
      );

      if (response.data.length === 0) {
        Swal.fire("No Students", "No students found for this batch and branch.", "info");
      }

      setViewedStudents(response.data);
      setViewedBatch(selectedBatch);
      setViewedBranch(selectedBranch);

      // Reset filters
      setFilterState("");
      setFilterDistrict("");

      // Collect unique states & districts for filter dropdowns
      const states = [
        ...new Set(
          response.data.map((s) => s.state).filter((s) => s && s !== "N/A")
        ),
      ].sort();
      const districts = [
        ...new Set(
          response.data.map((s) => s.district).filter((d) => d && d !== "N/A")
        ),
      ].sort();

      setAllStates(states);
      setAllDistricts(districts);
    } catch (err) {
      console.error("Error fetching students:", err);
      Swal.fire("Error", "Failed to fetch students. Try again later.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ─── Export to Excel ──────────────────────────────────────────────────────
  const handleExport = () => {
    if (!filteredStudents.length) return;

    const exportData = filteredStudents.map((s, i) => ({
      "#": i + 1,
      "Enrollment No": s.EnrollmentNo,
      "Student Name": s.StudentName,
      "Email ID": s.EmailId,
      "Mobile No": s.MobileNo,
      Batch: s.batch,
      Branch: s.branch,
      Role: s.role || "N/A",
      Village: s.village || "N/A",
      District: s.district || "N/A",
      State: s.state || "N/A",
      Pincode: s.pincode || "N/A",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");

    const fileParts = [
      "Students",
      viewedBatch,
      viewedBranch,
      filterState || null,
      filterDistrict || null,
    ]
      .filter(Boolean)
      .join("_");

    XLSX.writeFile(wb, `${fileParts}.xlsx`);
  };

  // ─── Cancel ───────────────────────────────────────────────────────────────
  const handleCancel = () => {
    setFile(null);
    setParsedData(null);
    setResponseData(null);
    setViewedStudents([]);
    setSuccessMsg("");
    setError("");
    setSelectedBatch("");
    setSelectedBranch("");
    setSelectedRole("");
    setFilterState("");
    setFilterDistrict("");
    setAllStates([]);
    setAllDistricts([]);
    if (inputRef.current) inputRef.current.value = null;
  };

  // ─── Template download ────────────────────────────────────────────────────
  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const wsData = [["EnrollmentNo", "StudentName", "EmailId", "MobileNo"]];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Student_Template.xlsx");
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="batches-page">
      <h2 className="center-heading">Batch Upload Page</h2>

      {/* Role Selection */}
      <label>Select Role:</label>
      <select
        value={selectedRole}
        onChange={(e) => setSelectedRole(e.target.value)}
        disabled={loading}
      >
        <option value="">-- Select Role --</option>
        {roles.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>

      {/* Batch Selection */}
      <label>Select Batch:</label>
      <select
        value={selectedBatch}
        onChange={(e) => setSelectedBatch(e.target.value)}
        disabled={loading}
      >
        <option value="">-- Select Batch --</option>
        {batchOptions.map((batch) => (
          <option key={batch} value={batch}>
            {batch}
          </option>
        ))}
        <option value="custom">+ Add Custom Batch</option>
      </select>

      {selectedBatch === "custom" && (
        <div className="custom-batch">
          <input
            type="number"
            placeholder="Enter start year (e.g. 2021)"
            value={customBatchYear}
            onChange={(e) => setCustomBatchYear(e.target.value)}
            disabled={loading}
          />
          <button onClick={handleAddBatch} disabled={loading || !customBatchYear}>
            Add
          </button>
        </div>
      )}

      {/* Branch Selection */}
      <label>Select Branch:</label>
      <select
        value={selectedBranch}
        onChange={(e) => setSelectedBranch(e.target.value)}
        disabled={loading}
      >
        <option value="">-- Select Branch --</option>
        {branches.map((branch) => (
          <option key={branch} value={branch}>
            {branch}
          </option>
        ))}
        <option value="custom">+ Add Custom Branch</option>
      </select>

      {selectedBranch === "custom" && (
        <div className="custom-branch">
          <input
            type="text"
            placeholder="Enter new branch name"
            value={customBranch}
            onChange={(e) => setCustomBranch(e.target.value)}
            disabled={loading}
          />
          <button onClick={handleBranchAdd} disabled={loading || !customBranch}>
            Add
          </button>
        </div>
      )}

      {/* File Drop Area */}
      <div
        className="drop-area"
        onClick={() => inputRef.current.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        Drag & drop file here or click to select
        <input
          type="file"
          ref={inputRef}
          accept=".csv,.xlsx"
          onChange={handleFileChange}
          disabled={loading}
        />
      </div>

      {/* File Preview */}
      {parsedData && parsedData.length > 0 && (
        <>
          <hr />
          <div className="file-stats">
            ✅ Rows: {fileInfo.rows} | Columns: {fileInfo.columns}
          </div>
          <div className="preview-table">
            <table>
              <thead>
                <tr>
                  {Object.keys(parsedData[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedData.slice(0, 5).map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((val, j) => (
                      <td key={j}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p>Showing first 5 rows...</p>
          </div>
        </>
      )}

      {/* Upload Response */}
      {responseData && (
        <div className="response-details">
          <h3>Upload Results</h3>
          <p>Total Rows Uploaded: {responseData.count}</p>
          {(responseData.duplicateRows?.length > 0 ||
            responseData.invalidRows?.length > 0) && (
            <div className="non-imported-rows">
              <h4>
                Issues Detected (
                {(responseData.duplicateRows?.length || 0) +
                  (responseData.invalidRows?.length || 0)}
                ):
              </h4>
              <ul>
                {responseData.duplicateRows?.map((row, i) => (
                  <li key={`duplicate-${i}`}>
                    {row.row.StudentName}: {row.reason} (Row {row.rowIndex})
                  </li>
                ))}
                {responseData.invalidRows?.map((row, i) => (
                  <li key={`invalid-${i}`}>
                    {row.row.StudentName}: {row.reason} (Row {row.rowIndex})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Buttons */}
      <div className="btn-row">
        <button
          className="submit-btn"
          onClick={handleUpload}
          disabled={
            !file ||
            !selectedBatch ||
            selectedBatch === "custom" ||
            !selectedBranch ||
            selectedBranch === "custom" ||
            !selectedRole ||
            selectedRole === "custom" ||
            loading
          }
        >
          {loading ? "Uploading..." : "Upload"}
        </button>

        <button
          onClick={handleDownloadTemplate}
          className="preview-btn"
          disabled={loading}
        >
          Template
        </button>

        <button
          className="view-btn"
          onClick={handleViewStudents}
          disabled={
            !selectedBatch ||
            selectedBatch === "custom" ||
            !selectedBranch ||
            selectedBranch === "custom" ||
            loading
          }
        >
          View Students
        </button>

        <button
          className="delete-btn"
          onClick={handleDeleteBatch}
          disabled={!customBatches.includes(selectedBatch) || loading}
        >
          Delete Batch
        </button>

        <button
          className={`cancel-btn ${
            selectedBatch || selectedBranch || selectedRole ? "active" : "disabled"
          }`}
          onClick={handleCancel}
          disabled={!selectedBatch && !selectedBranch && !selectedRole}
        >
          Cancel
        </button>
      </div>

      {loading && <div className="spinner"></div>}

      {/* Students Table with Filters + Export */}
      {viewedStudents.length > 0 && (
        <div className="preview-table">
          {/* Table header controls */}
          <div className="table-controls">
            <h3>
              Students in {viewedBatch} – {viewedBranch}&nbsp;
              <span className="count-badge">
                {filteredStudents.length} / {viewedStudents.length}
              </span>
            </h3>

            <div className="filters">
              {/* State filter */}
              <select
                value={filterState}
                onChange={(e) => {
                  setFilterState(e.target.value);
                  setFilterDistrict(""); // reset district when state changes
                }}
              >
                <option value="">All States</option>
                {allStates.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              {/* District filter (narrows based on selected state) */}
              <select
                value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
                disabled={!filterState && allDistricts.length === 0}
              >
                <option value="">All Districts</option>
                {visibleDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              {/* Export button */}
              <button
                className="export-btn"
                onClick={handleExport}
                disabled={!filteredStudents.length}
              >
                ⬇ Export Excel
              </button>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Enrollment No</th>
                <th>Student Name</th>
                <th>Email ID</th>
                <th>Mobile No</th>
                <th>Batch</th>
                <th>Branch</th>
                <th>Role</th>
                <th>Village</th>
                <th>District</th>
                <th>State</th>
                <th>Pincode</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, index) => (
                <tr key={student._id}>
                  <td>{index + 1}</td>
                  <td>{student.EnrollmentNo}</td>
                  <td>{student.StudentName}</td>
                  <td>{student.EmailId}</td>
                  <td>{student.MobileNo}</td>
                  <td>{student.batch}</td>
                  <td>{student.branch}</td>
                  <td>{student.role || "N/A"}</td>
                  <td>{student.village || "N/A"}</td>
                  <td>{student.district || "N/A"}</td>
                  <td>{student.state || "N/A"}</td>
                  <td>{student.pincode || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredStudents.length === 0 && (
            <p className="no-results">No students match the selected filters.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Batches;