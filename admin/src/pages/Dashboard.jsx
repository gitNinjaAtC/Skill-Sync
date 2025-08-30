import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./dashboard.scss";

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8800"
    : "https://skill-sync-backend-522o.onrender.com";

const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, students: 0, alumni: 0, admins: 0, faculty: 0 });
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchRecentUsers();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/API_B/admin/stats`, {
        withCredentials: true,
      });
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const fetchRecentUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/API_B/admin/users`, {
        withCredentials: true,
      });
      const latest = res.data.slice(-5).reverse(); // Last 5 users
      setRecentUsers(latest);
    } catch (err) {
      console.error("Failed to fetch recent users:", err);
    }
  };

  return (
    <div className="dashboard-page">
      <h1>Admin Dashboard</h1>

      <div className="stat-cards">
        <div className="card total">
          <h3>Total Users</h3>
          <p>{stats.total}</p>
        </div>
        <div className="card students">
          <h3>Students</h3>
          <p>{stats.students}</p>
        </div>
        <div className="card alumni">
          <h3>Alumni</h3>
          <p>{stats.alumni}</p>
        </div>
        <div className="card admins">
          <h3>Admins</h3>
          <p>{stats.admins}</p>
        </div>
        <div className="card faculty">
          <h3>Faculty</h3>
          <p>{stats.faculty}</p>
        </div>
      </div>

      <div className="recent-users">
        <div className="header">
          <h2>Recent Users</h2>
          <Link to="/users">View All</Link>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {recentUsers.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
