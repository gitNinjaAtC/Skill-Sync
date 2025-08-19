import React, { useEffect, useState } from "react";
import axios from "axios";
import "./manageUsers.scss";

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8800"
    : "https://skill-sync-backend-522o.onrender.com";

const ManageUsers = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const [pendingRes, approvedRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/API_B/admin/users?active=false`, {
          withCredentials: true,
        }),
        axios.get(`${API_BASE_URL}/API_B/admin/users?active=true`, {
          withCredentials: true,
        }),
      ]);
      setPendingUsers(pendingRes.data);
      setApprovedUsers(approvedRes.data);
      setError("");
    } catch (err) {
      console.error("❌ Error fetching users:", err);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/API_B/admin/approve/${id}`, {}, {
        withCredentials: true,
      });
      fetchAllUsers();
    } catch (err) {
      console.error("❌ Error approving user:", err);
      setError("Failed to approve user.");
    }
  };

  return (
    <div className="manage-users">
      <div className="tabs">
        <button
          className={activeTab === "pending" ? "tab active" : "tab"}
          onClick={() => setActiveTab("pending")}
        >
          Pending Users
        </button>
        <button
          className={activeTab === "approved" ? "tab active" : "tab"}
          onClick={() => setActiveTab("approved")}
        >
          Approved Users
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}

      {activeTab === "pending" && (
        <>
          <table className="user-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.length > 0 ? (
                pendingUsers.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      <button onClick={() => handleApprove(user._id)}>
                        Approve
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No pending users.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}

      {activeTab === "approved" && (
        <>
          <table className="user-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {approvedUsers.length > 0 ? (
                approvedUsers.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      <span className="approved-label">✔ Approved</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No approved users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default ManageUsers;
