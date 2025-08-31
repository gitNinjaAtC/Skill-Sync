import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./loginform.scss";

// Tab options
const roleOptions = [
  { value: "student", label: "Student" },
  { value: "alumni", label: "Alumni" },
  { value: "faculty", label: "Faculty" },
];

export const RegisterForm = () => {
  const [inputs, setInputs] = useState({
    email: "",
    enrollmentNo: "",
    password: "",
    name: "",
    role: "student", // default to student, or empty string if none selected
  });
  const [err, setErr] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Input change handler
  const handleChange = (e) => {
    setInputs((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErr(null);
    setSuccess(null);
  };

  // Tab click handler
  const handleRoleTabClick = (roleValue) => {
    setInputs((prev) => ({
      ...prev,
      role: roleValue,
    }));
    setErr(null);
    setSuccess(null);
  };

  const handleClose = () => {
    navigate("/", { replace: true });
    window.location.reload();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setSuccess(null);

    try {
      await axios.post(
        "https://skill-sync-backend-522o.onrender.com/API_B/auth/register",
        { ...inputs }
      );

      if (inputs.role === "faculty") {
        setSuccess("Registration successful. Waiting for Admin Approval.");
      } else {
        setSuccess("Your registration is successful. Please proceed to login.");
      }
      setInputs({
        email: "",
        enrollmentNo: "",
        password: "",
        name: "",
        role: "student", // or reset as needed
      });

      setTimeout(() => navigate("/"), 3000);
    } catch (err) {
      const message =
        typeof err?.response?.data === "string"
          ? err.response.data
          : err?.response?.data?.error ||
            err?.response?.data?.message ||
            "Registration failed. Please try again.";
      setErr(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-wrapper">
        <div className="container">
          <button className="close-btn" onClick={handleClose}>
            ×
          </button>
          <div className="heading">Register</div>

          {/* Role Tabs */}
          <div className="role-tabs">
            {roleOptions.map((role) => (
              <button
                key={role.value}
                className={`role-tab ${
                  inputs.role === role.value ? "active" : ""
                }`}
                type="button"
                onClick={() => handleRoleTabClick(role.value)}
              >
                {role.label}
              </button>
            ))}
          </div>

          <form className="form" onSubmit={handleSubmit}>
            <input
              required
              className="input"
              type="text"
              name="name"
              placeholder="Full Name"
              value={inputs.name}
              onChange={handleChange}
            />
            <input
              required
              className="input"
              type="email"
              name="email"
              placeholder="E-mail"
              value={inputs.email}
              onChange={handleChange}
            />
            <input
              required={inputs.role !== "faculty"}
              className={`input enrollment-input ${
                inputs.role === "faculty" ? "hide-enrollment" : ""
              }`}
              type="text"
              name="enrollmentNo"
              placeholder="Enrollment No"
              value={inputs.enrollmentNo}
              onChange={handleChange}
            />
            <input
              required
              className="input"
              type="password"
              name="password"
              placeholder="Password"
              value={inputs.password}
              onChange={handleChange}
            />
            {inputs.role !== "faculty" && (
              <Link to="/forgot-Enrollment" className="forgot-link">
                Forgot Enrollment Number?
              </Link>
            )}
            {err && <p className="error">{err}</p>}
            {success && <p className="success">{success}</p>}
            <input
              className="login-button"
              type="submit"
              value={loading ? "Registering..." : "Register"}
              disabled={loading}
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
