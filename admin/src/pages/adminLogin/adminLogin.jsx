import React, { useState } from "react";
import "./adminLogin.scss";
import axios from "axios";

const AdminLogin = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-select backend: if on localhost, use local; else use Render
  const API_BASE_URL = window.location.hostname === "localhost"
    ? "http://localhost:8800"
    : "https://skill-sync-backend-522o.onrender.com";

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_BASE_URL}/API_B/admin/login`, credentials, {
        withCredentials: true,
      });

      const { token, admin } = res.data;

      localStorage.setItem("adminToken", token);
      localStorage.setItem("adminData", JSON.stringify(admin));
      onLogin(admin);
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <form className="admin-login-form" onSubmit={handleLogin}>
        <h2>Admin Login</h2>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={credentials.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={credentials.password}
          onChange={handleChange}
          required
        />

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
