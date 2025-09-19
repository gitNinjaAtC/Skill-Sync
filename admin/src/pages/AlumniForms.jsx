import React, { useEffect, useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import "./AlumniForms.scss";

const AlumniForms = () => {
  const [forms, setForms] = useState([]);
  const [filteredForms, setFilteredForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Filter states
  const [attendingFilter, setAttendingFilter] = useState("All");
  const [batchFilter, setBatchFilter] = useState("All");
  const [branchFilter, setBranchFilter] = useState("All");
  
  // Available filter options
  const [availableBatches, setAvailableBatches] = useState([]);
  const [availableBranches, setAvailableBranches] = useState([]);

  const token = localStorage.getItem("adminToken");
  const API_BASE_URL = "https://skill-sync-backend-522o.onrender.com/API_B/admin";

  const fetchAlumniForms = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/alumni-forms`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const formsData = response.data;
      
      // The backend now returns forms already enriched with batch and branch data
      setForms(formsData);
      setFilteredForms(formsData);
      
      // Extract unique batches and branches for filter options
      const batches = [...new Set(formsData.map(form => form.batch).filter(batch => batch && batch !== "N/A"))];
      const branches = [...new Set(formsData.map(form => form.branch).filter(branch => branch && branch !== "N/A"))];
      
      setAvailableBatches(batches.sort());
      setAvailableBranches(branches.sort());
      
      // Debug logging
      console.log("Received forms data:", formsData.slice(0, 2));
      console.log("Available batches:", batches);
      console.log("Available branches:", branches);
      
      setError("");
    } catch (err) {
      console.error("Error fetching alumni forms:", err);
      setError("Failed to fetch alumni forms.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumniForms();
  }, []);

  // Apply all filters when any filter changes
  useEffect(() => {
    let filtered = forms;

    // Filter by attending status
    if (attendingFilter !== "All") {
      filtered = filtered.filter((form) => form.attending === attendingFilter);
    }

    // Filter by batch
    if (batchFilter !== "All") {
      filtered = filtered.filter((form) => form.batch === batchFilter);
    }

    // Filter by branch
    if (branchFilter !== "All") {
      filtered = filtered.filter((form) => form.branch === branchFilter);
    }

    setFilteredForms(filtered);
  }, [attendingFilter, batchFilter, branchFilter, forms]);

  const resetFilters = () => {
    setAttendingFilter("All");
    setBatchFilter("All");
    setBranchFilter("All");
  };

  const exportCSV = () => {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Batch",
      "Branch",
      "Occupation",
      "City",
      "Special Requirements",
      "Accommodation Required",
      "Accommodation Dates",
      "Attending",
    ];

    const rows = filteredForms.map((form) => [
      form.userId?.name || "N/A",
      form.userId?.email || "N/A",
      form.phoneNumber || "N/A",
      form.batch || "N/A",
      form.branch || "N/A",
      form.occupation || "N/A",
      form.city || "N/A",
      form.specialRequirements || "N/A",
      form.accommodation?.required ? "Yes" : "No",
      form.accommodation?.dates?.join(", ") || "N/A",
      form.attending || "N/A",
    ]);

    let csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "alumni_forms.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const doc = new jsPDF('landscape'); // Use landscape for more columns
    doc.setFontSize(16);
    doc.text("Alumni Forms Report", 14, 20);
    
    // Add filter information
    doc.setFontSize(10);
    let filterText = `Filters Applied: Attending: ${attendingFilter}, Batch: ${batchFilter}, Branch: ${branchFilter}`;
    doc.text(filterText, 14, 30);

    const headers = [
      "Name",
      "Email", 
      "Phone",
      "Batch",
      "Branch",
      "Occupation",
      "City",
      "Special Req.",
      "Accommodation",
      "Acc. Dates",
      "Attending",
    ];

    const rows = filteredForms.map((form) => [
      form.userId?.name || "N/A",
      form.userId?.email || "N/A",
      form.phoneNumber || "N/A",
      form.batch || "N/A",
      form.branch || "N/A",
      form.occupation || "N/A",
      form.city || "N/A",
      form.specialRequirements || "N/A",
      form.accommodation?.required ? "Yes" : "No",
      form.accommodation?.dates?.join(", ") || "N/A",
      form.attending || "N/A",
    ]);

    let startY = 40;
    doc.setFontSize(8);
    doc.text(headers.join(" | "), 14, startY);

    rows.forEach((row, index) => {
      startY += 6;
      if (startY > 190) { // Adjusted for landscape
        doc.addPage();
        startY = 20;
        doc.text(headers.join(" | "), 14, startY);
        startY += 6;
      }
      doc.text(row.join(" | "), 14, startY);
    });

    doc.save("alumni_forms.pdf");
  };

  if (loading) return <div className="loading-message">Loading alumni forms...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (forms.length === 0) return <div className="no-data-message">No alumni forms found.</div>;

  return (
    <div className="alumni-forms-container">
      <h2>Alumni Meet Form Data</h2>
      
      <div className="controls">
        <div className="action-buttons">
          <button className="back-btn" onClick={() => window.history.back()}>
            ← Back
          </button>
          <button className="export-btn csv" onClick={exportCSV}>
            📄 Export CSV
          </button>
          <button className="export-btn pdf" onClick={exportPDF}>
            📑 Export PDF
          </button>
        </div>

        <div className="filters-section">
          <h4>Filters</h4>
          <div className="filters-grid">
            <div className="filter-group">
              <label>Attending Status:</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="attending"
                    value="All"
                    checked={attendingFilter === "All"}
                    onChange={(e) => setAttendingFilter(e.target.value)}
                  />
                  <span className="radio-custom"></span>
                  All
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="attending"
                    value="Yes"
                    checked={attendingFilter === "Yes"}
                    onChange={(e) => setAttendingFilter(e.target.value)}
                  />
                  <span className="radio-custom"></span>
                  Attending
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="attending"
                    value="No"
                    checked={attendingFilter === "No"}
                    onChange={(e) => setAttendingFilter(e.target.value)}
                  />
                  <span className="radio-custom"></span>
                  Not Attending
                </label>
              </div>
            </div>

            <div className="filter-group">
              <label>Batch:</label>
              <select value={batchFilter} onChange={(e) => setBatchFilter(e.target.value)}>
                <option value="All">All Batches</option>
                {availableBatches.map((batch) => (
                  <option key={batch} value={batch}>
                    {batch}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Branch:</label>
              <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
                <option value="All">All Branches</option>
                {availableBranches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <button className="reset-filters-btn" onClick={resetFilters}>
                🔄 Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="results-summary">
        <p>Showing <strong>{filteredForms.length}</strong> of <strong>{forms.length}</strong> forms</p>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Batch</th>
              <th>Branch</th>
              <th>Occupation</th>
              <th>City</th>
              <th>Special Requirements</th>
              <th>Accommodation Required</th>
              <th>Accommodation Dates</th>
              <th>Attending</th>
            </tr>
          </thead>
          <tbody>
            {filteredForms.map((form) => (
              <tr key={form._id}>
                <td>{form.userId?.name || "N/A"}</td>
                <td>{form.userId?.email || "N/A"}</td>
                <td>{form.phoneNumber || "N/A"}</td>
                <td>
                  <span className="batch-tag">{form.batch || "N/A"}</span>
                </td>
                <td>
                  <span className="branch-tag">{form.branch || "N/A"}</span>
                </td>
                <td>{form.occupation || "N/A"}</td>
                <td>{form.city || "N/A"}</td>
                <td>{form.specialRequirements || "N/A"}</td>
                <td>
                  <span className={`status-badge ${form.accommodation?.required ? 'yes' : 'no'}`}>
                    {form.accommodation?.required ? "Yes" : "No"}
                  </span>
                </td>
                <td>{form.accommodation?.dates?.join(", ") || "N/A"}</td>
                <td>
                  <span className={`status-badge ${form.attending?.toLowerCase()}`}>
                    {form.attending || "N/A"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AlumniForms;