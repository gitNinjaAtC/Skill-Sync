import React, { useEffect, useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import "./AlumniForms.scss"; // Import the SCSS file here

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8800/API_B/admin"
    : "https://skill-sync-backend-522o.onrender.com/API_B/admin";

const AlumniForms = () => {
  const [forms, setForms] = useState([]);
  const [filteredForms, setFilteredForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const fetchAlumniForms = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("adminToken");
        if (!token) {
          setError("Admin not authenticated");
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/alumni-forms`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });

        setForms(response.data);
        setFilteredForms(response.data);
      } catch (err) {
        console.error("Error fetching alumni forms:", err);
        if (err.response && err.response.status === 401) {
          setError("Unauthorized. Please login again.");
        } else if (err.response && err.response.status === 404) {
          setError("Alumni forms endpoint not found.");
        } else {
          setError("Failed to fetch alumni forms. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAlumniForms();
  }, []);

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilter(value);

    if (value === "All") {
      setFilteredForms(forms);
    } else {
      const filtered = forms.filter((form) => form.attending === value);
      setFilteredForms(filtered);
    }
  };

  const exportCSV = () => {
    const headers = [
      "Name",
      "Email",
      "Phone",
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
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text("Alumni Forms", 14, 20);

    const headers = [
      "Name",
      "Email",
      "Phone",
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
      form.occupation || "N/A",
      form.city || "N/A",
      form.specialRequirements || "N/A",
      form.accommodation?.required ? "Yes" : "No",
      form.accommodation?.dates?.join(", ") || "N/A",
      form.attending || "N/A",
    ]);

    let startY = 30;
    doc.text(headers.join(" | "), 14, startY);

    rows.forEach((row) => {
      startY += 8;
      if (startY > 270) {
        doc.addPage();
        startY = 20;
      }
      doc.text(row.join(" | "), 14, startY);
    });

    doc.save("alumni_forms.pdf");
  };

  if (loading) {
    return <div className="loading-message">Loading alumni forms...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (forms.length === 0) {
    return <div className="no-data-message">No alumni forms found.</div>;
  }

  return (
    <div className="alumni-forms-container">
      <h2>Alumni Meet Form Data</h2>
      <div className="controls">
        <button onClick={() => window.history.back()}>Back</button>
        <button onClick={exportCSV}>Export as CSV</button>
        <button onClick={exportPDF}>Export as PDF</button>
        <select value={filter} onChange={handleFilterChange}>
          <option value="All">All</option>
          <option value="Yes">Attending: Yes</option>
          <option value="No">Attending: No</option>
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
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
              <td>{form.occupation || "N/A"}</td>
              <td>{form.city || "N/A"}</td>
              <td>{form.specialRequirements || "N/A"}</td>
              <td>{form.accommodation?.required ? "Yes" : "No"}</td>
              <td>{form.accommodation?.dates?.join(", ") || "N/A"}</td>
              <td>{form.attending || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AlumniForms;
