import React, { useEffect, useState } from "react";
import axios from "axios";

const AlumniForms = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAlumniForms = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("adminToken"); // Adjust if you use another method

        const response = await axios.get("/admin/alumni-forms", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setForms(response.data);
      } catch (err) {
        console.error("Error fetching alumni forms:", err);
        setError("Failed to fetch alumni forms. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAlumniForms();
  }, []);

  if (loading) {
    return <div>Loading alumni forms...</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  if (forms.length === 0) {
    return <div>No alumni forms found.</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Alumni Forms</h2>
      <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Form Details</th>
          </tr>
        </thead>
        <tbody>
          {forms.map((form) => (
            <tr key={form._id}>
              <td>{form.userId?.name || "N/A"}</td>
              <td>{form.userId?.email || "N/A"}</td>
              <td>
                <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  {JSON.stringify(form, null, 2)}
                </pre>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AlumniForms;
