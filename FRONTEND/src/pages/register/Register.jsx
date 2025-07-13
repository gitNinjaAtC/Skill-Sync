import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./register.scss";
import axios from "axios";

const Register = () => {
  const [inputs, setInputs] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
    role: "student", // default role
  });

  const [err, setErr] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setInputs((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErr(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        "https://skill-sync-backend-522o.onrender.com/API_B/auth/register",
        inputs
      );

      setSuccess("Registration successful. Awaiting admin approval.");
      setInputs({ username: "", email: "", password: "", name: "", role: "student" });

      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      const message =
        typeof err.response?.data === "string"
          ? err.response.data
          : err.response?.data?.error ||
            err.response?.data?.message ||
            "Registration failed. Please try again.";
      setErr(message);
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register">
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Registering, please wait...</p>
        </div>
      )}

      <div className={`card ${loading ? "faded" : ""}`}>
        <div className="left">
          <h1>SISTEC</h1>
          <p>
            Reconnect with classmates, explore career opportunities, and stay
            updated on events and achievements. Join a network that lasts a lifetime!
          </p>
          <span>Already have an account?</span>
          <Link to="/login">
            <button>Login</button>
          </Link>
        </div>

        <div className="right">
          <h1>Register</h1>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Username"
              name="username"
              value={inputs.username}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              placeholder="Email"
              name="email"
              value={inputs.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              placeholder="Password"
              name="password"
              value={inputs.password}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              placeholder="Full Name"
              name="name"
              value={inputs.name}
              onChange={handleChange}
              required
            />
            <select name="role" value={inputs.role} onChange={handleChange} required>
              <option value="student">Student</option>
              <option value="alumni">Alumni</option>
            </select>

            {err && <p className="error">{err}</p>}
            {success && <p className="success">{success}</p>}

            <button type="submit" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
