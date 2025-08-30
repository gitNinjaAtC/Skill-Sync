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

  // ✅ Unified fetch function
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

  // ✅ Approve user
  const handleApprove = async (id) => {
    try {
      await axios.put(
        `${API_BASE_URL}/API_B/admin/approve/${id}`,
        {},
        {
          withCredentials: true,
        }
      );
      fetchAllUsers(); // refresh
    } catch (err) {
      console.error("❌ Error approving user:", err);
      setError("Failed to approve user.");
    }
  };

  // ✅ Delete/Reject user
  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`${API_BASE_URL}/API_B/admin/user/${userId}`, {
          withCredentials: true,
        });
        fetchAllUsers(); // refresh updated user list
      } catch (err) {
        console.error("❌ Error deleting user:", err);
        setError("Failed to delete user.");
      }
    }
  };

  return (
    <div className="manage-users">
      {/* Tabs */}
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

      {/* Loading and Error messages */}
      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}

      {/* Pending Users Table */}
      {activeTab === "pending" && (
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
                    <button onClick={() => handleDelete(user._id)}>
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>
                  No pending users.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Approved Users Table */}
      {activeTab === "approved" && (
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
                <td colSpan="4" style={{ textAlign: "center" }}>
                  No approved users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageUsers;
