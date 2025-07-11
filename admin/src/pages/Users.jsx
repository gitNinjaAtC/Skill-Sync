import React, { useEffect, useState } from "react";
import axios from "axios";
import "./users.scss";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [originalUsers, setOriginalUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, students: 0, alumni: 0, admins: 0 });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all, approved, pending

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [filter]);

  const fetchUsers = () => {
    setLoading(true);
    let url = "http://localhost:8800/API_B/admin/users";

    if (filter === "approved") url += "?active=true";
    else if (filter === "pending") url += "?active=false";

    axios
      .get(url, { withCredentials: true })
      .then((res) => {
        setUsers(res.data);
        setOriginalUsers(res.data);
      })
      .catch((err) => console.error("Error fetching users:", err))
      .finally(() => setLoading(false));
  };

  const fetchStats = () => {
    axios
      .get("http://localhost:8800/API_B/admin/stats", { withCredentials: true })
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Error fetching stats:", err));
  };

  const handleRoleChange = (userId, newRole) => {
    axios
      .put(
        `http://localhost:8800/API_B/admin/user/${userId}/role`,
        { role: newRole },
        { withCredentials: true }
      )
      .then(() => {
        fetchUsers();
        fetchStats();
      })
      .catch((err) => console.error("Error updating role:", err));
  };

  const handleDelete = (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      axios
        .delete(`http://localhost:8800/API_B/admin/user/${userId}`, {
          withCredentials: true,
        })
        .then(() => {
          fetchUsers();
          fetchStats();
        })
        .catch((err) => console.error("Error deleting user:", err));
    }
  };

  // const handleApprove = (userId) => {
  //   axios
  //     .post(
  //       "http://localhost:8800/API_B/admin/approve-user",
  //       { userId },
  //       { withCredentials: true }
  //     )
  //     .then(() => {
  //       fetchUsers();
  //       fetchStats();
  //     })
  //     .catch((err) => console.error("Error approving user:", err));
  // };

  const handleSearch = (e) => {
    const keyword = e.target.value.toLowerCase();
    setSearch(keyword);
    const filtered = originalUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(keyword) ||
        u.email.toLowerCase().includes(keyword)
    );
    setUsers(filtered);
  };

  return (
    <div className="users-page">
      <h1>All Users</h1>

      <div className="stats-box">
        <div className="stat"><h3>Total</h3><p>{stats.total}</p></div>
        <div className="stat"><h3>Students</h3><p>{stats.students}</p></div>
        <div className="stat"><h3>Alumni</h3><p>{stats.alumni}</p></div>
        <div className="stat"><h3>Admins</h3><p>{stats.admins}</p></div>
      </div>

      <div className="filter-buttons">
        <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All</button>
        <button className={filter === "approved" ? "active" : ""} onClick={() => setFilter("approved")}>Approved</button>
        <button className={filter === "pending" ? "active" : ""} onClick={() => setFilter("pending")}>Pending</button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={handleSearch}
        />
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : users.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                  >
                    <option value="student">Student</option>
                    <option value="alumni">Alumni</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  {u.isActive ? "✅ Active" : "🕓 Pending"}
                </td>
                <td>
                  <button onClick={() => handleDelete(u._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No users found.</p>
      )}
    </div>
  );
};

export default Users;
