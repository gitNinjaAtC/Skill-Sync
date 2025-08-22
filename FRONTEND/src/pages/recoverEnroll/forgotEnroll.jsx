import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./forgotEnroll.scss";

const ForgotEnrollment = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      console.log("Sending recovery request with email:", email);
      const res = await axios.post(
         "https://skill-sync-backend-522o.onrender.com/API_B/auth/forgot-enrollment",
        "http://localhost:8800/API_B/auth/forgot-enrollment",
        { email }
      );
      console.log("Response:", res.data);
      setMessage(res.data.message);
      setIsError(false);
      setEmail("");
      setTimeout(() => navigate("/"), 3000); // Redirect to homepage after 3 seconds
    } catch (err) {
      console.error("Error:", err.response?.data, err.message);
      const errorMessage =
        err.response?.data?.message ||
        "Something went wrong. Please try again.";
      setMessage(errorMessage);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-enrollment">
      <div className="card">
        <h2>Forgot Enrollment</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your college email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading} // Disable input during loading
          />
          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send recover Link"}
          </button>
        </form>
        {message && (
          <p className={isError ? "error-message" : "success-message"}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotEnrollment;
