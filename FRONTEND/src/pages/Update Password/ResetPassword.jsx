import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import icons
import "./resetPassword.scss";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    if (newPassword !== confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      const res = await axios.post(
        `https://skill-sync-backend-522o.onrender.com/API_B/auth/reset-password/${token}`,
        { newPassword },
        { withCredentials: true }
      );
      setMessage("✅ " + res.data);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      const msg = err.response?.data || "❌ Failed to reset password.";
      setError(typeof msg === "string" ? msg : msg.message);
    }
  };

  return (
    <div className="reset-password">
      <div className="card">
        <h2>Reset Your Password</h2>
        <form onSubmit={handleReset}>
          <div className="password-input">
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <span onClick={() => setShowNewPassword(!showNewPassword)}>
              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div className="password-input">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <span onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button type="submit">Update Password</button>
        </form>
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
      </div>
    </div>
  );
};

export default ResetPassword;
