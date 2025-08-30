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
  const [viewedBatch, setViewedBatch] = useState(""); // ✅ added
  const [viewedBranch, setViewedBranch] = useState(""); // ✅ added
  const inputRef = useRef();

  const allowedTypes = ["csv", "xlsx"];
  const defaultBatches = generateBatches();
  const batchOptions = [...defaultBatches, ...customBatches];

  const processFileForPreview = (file) => {
    if (!file) return;
    setError("");
    setSuccessMsg("");
    setResponseData(null);

    const ext = file.name.split(".").pop().toLowerCase();
    if (!allowedTypes.includes(ext)) {
      Swal.fire(
        "Invalid File",
        "Only .csv and .xlsx files are allowed.",
        "error"
      );
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

  const handleBranchAdd = () => {
    const newBranch = customBranch.trim().toUpperCase();
    if (!newBranch || newBranch.length < 2) {
      Swal.fire(
        "Invalid Branch",
        "Please enter a valid branch name.",
        "warning"
      );
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
      Swal.fire(
        "Cannot Delete",
        "Only custom batches can be deleted.",
        "warning"
      );
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

      const API_BASE_URL =
        window.location.hostname === "localhost"
          ? "http://localhost:8800"
          : "https://skill-sync-backend-522o.onrender.com";
      const response = await axios.post(
        `${API_BASE_URL}/API_B/admin/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setSuccessMsg(
        `Data uploaded successfully! ${response.data.count} rows imported.`
      );
      setResponseData(response.data);
      Swal.fire(
        "Upload Successful",
        `${response.data.count} rows imported.`,
        "success"
      );
    } catch (err) {
      console.error("Upload error:", err.response?.data, err.message);
      Swal.fire(
        "Upload Failed",
        err.response?.data?.error || err.message,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

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
      const API_BASE_URL =
        window.location.hostname === "localhost"
          ? "http://localhost:8800"
          : "https://skill-sync-backend-522o.onrender.com";
      const response = await axios.get(`${API_BASE_URL}/API_B/admin/students`, {
        params: { batch: selectedBatch, branch: selectedBranch },
      });

      if (response.data.length === 0) {
        Swal.fire(
          "No Students",
          "No students found for this batch and branch.",
          "info"
        );
      }

      setViewedStudents(response.data);
      setViewedBatch(selectedBatch); // ✅ store context
      setViewedBranch(selectedBranch); // ✅ store context
    } catch (err) {
      console.error("Error fetching students:", err);
      Swal.fire("Error", "Failed to fetch students. Try again later.", "error");
    } finally {
      setLoading(false);
    }
  };

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
    if (inputRef.current) inputRef.current.value = null;
  };

  // Inside your Batches component, add this function to create and download Excel file
  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    // Define empty sheet data with only headers + no rows
    const wsData = [["EnrollmentNo", "StudentName", "EmailId", "MobileNo"]];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Template");

    // Generate Excel file and trigger download
    XLSX.writeFile(wb, "Student_Template.xlsx");
  };

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
          <button
            onClick={handleAddBatch}
            disabled={loading || !customBatchYear}
          >
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
            selectedBatch || selectedBranch || selectedRole
              ? "active"
              : "disabled"
          }`}
          onClick={handleCancel}
          disabled={!selectedBatch && !selectedBranch && !selectedRole}
        >
          Cancel
        </button>
      </div>

      {loading && <div className="spinner"></div>}

      {/* Students Table */}
      {viewedStudents.length > 0 && (
        <div className="preview-table">
          <h3>
            Students in {viewedBatch} - {viewedBranch}
          </h3>
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
              </tr>
            </thead>
            <tbody>
              {viewedStudents.map((student, index) => (
                <tr key={student._id}>
                  <td>{index + 1}</td>
                  <td>{student.EnrollmentNo}</td>
                  <td>{student.StudentName}</td>
                  <td>{student.EmailId}</td>
                  <td>{student.MobileNo}</td>
                  <td>{student.batch}</td>
                  <td>{student.branch}</td>
                  <td>{student.role || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Batches;
