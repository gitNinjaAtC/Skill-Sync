import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import "./uploadForm.scss";
import axios from "axios";

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

const UploadForm = ({ onClose }) => {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [responseData, setResponseData] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [fileInfo, setFileInfo] = useState({ rows: 0, columns: 0 });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();

  const allowedTypes = ["csv", "xlsx"];
  const batchOptions = generateBatches();

  const processFileForPreview = (file) => {
    if (!file) return;

    setError("");
    setSuccessMsg("");
    setResponseData(null);

    const ext = file.name.split(".").pop().toLowerCase();
    if (!allowedTypes.includes(ext)) {
      setError("Only .csv and .xlsx files are allowed.");
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
        setError("Uploaded file is empty.");
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
    if (!file || !selectedBatch) {
      setError("Please select a batch and upload a valid file.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("batch", selectedBatch);

      console.log("Uploading file with batch:", selectedBatch);
      const response = await axios.post(
        "http://localhost:8800/API_B/admin/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Response:", response.data);
      setSuccessMsg(
        `Data uploaded successfully! ${response.data.count} rows imported.`
      );
      setResponseData(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Upload error:", err.response?.data, err.message);
      setError(
        "Failed to upload data: " + (err.response?.data?.error || err.message)
      );
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div
        className="modal-form"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <h2 className="center-heading">Upload User Data</h2>

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
        </select>

        <div className="drop-area" onClick={() => inputRef.current.click()}>
          Drag & drop file here or click to select
          <input
            type="file"
            ref={inputRef}
            accept=".csv,.xlsx"
            onChange={handleFileChange}
            disabled={loading}
          />
        </div>

        {error && <div className="error">{error}</div>}
        {successMsg && <div className="success">{successMsg}</div>}

        {parsedData && parsedData.length > 0 && (
          <>
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

        <div className="btn-row">
          <button
            className="submit-btn"
            onClick={handleUpload}
            disabled={!file || !selectedBatch || loading}
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
          <button className="close-btn" onClick={onClose} disabled={loading}>
            Close
          </button>
        </div>

        {loading && <div className="spinner"></div>}
      </div>
    </div>
  );
};

export default UploadForm;
