import React, { useState } from "react";
import axios from "axios";
import "./createAdmin.scss";
import { FaEye, FaEyeSlash } from "react-icons/fa";

// Auto-detect base URL
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8800"
    : "https://skill-sync-backend-522o.onrender.com";

const CreateAdmin = ({ onClose }) => {
  const [inputs, setInputs] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setInputs((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("adminToken");

      const res = await axios.post(
        `${API_BASE_URL}/API_B/admin/create`,
        inputs,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMessage({
        type: "success",
        text: res.data.message || "Admin created successfully",
      });

      // Reset form fields
      setInputs({ username: "", name: "", email: "", password: "" });
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          err.message ||
          "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="create-admin-container">
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>
        <h2 className="center-heading">Create New Admin</h2>
        <form onSubmit={handleSubmit} className="create-admin-form">
          <input
            type="text"
            name="username"
            value={inputs.username}
            onChange={handleChange}
            placeholder="Admin Username"
            required
          />
          <input
            type="text"
            name="name"
            value={inputs.name}
            onChange={handleChange}
            placeholder="Admin Name"
            required
          />
          <input
            type="email"
            name="email"
            value={inputs.email}
            onChange={handleChange}
            placeholder="Admin Email"
            required
          />
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={inputs.password}
              onChange={handleChange}
              placeholder="Password"
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Admin"}
          </button>

          {message.text && (
            <p className={`message ${message.type}`}>{message.text}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateAdmin;
