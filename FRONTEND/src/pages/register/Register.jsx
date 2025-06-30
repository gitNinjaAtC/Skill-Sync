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
  });
  const [err, setErr] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErr(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        "https://skill-sync-backend-522o.onrender.com/API_B/auth/register",
        inputs
      );
      setSuccess("User successfully created!");
      setInputs({ username: "", email: "", password: "", name: "" });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const errorMessage =
        typeof err.response?.data === "string"
          ? err.response.data
          : err.response?.data?.message ||
            "Registration failed. Please try again.";
      setErr(errorMessage);
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register">
      {/* ✅ Overlay spinner when loading */}
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
            updated on events and achievements. Join a network that lasts a
            lifetime!
          </p>
          <span>Do you have an account?</span>
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
              placeholder="Name"
              name="name"
              value={inputs.name}
              onChange={handleChange}
              required
            />
            {err && <p className="error">{err}</p>}
            {success && <p className="success">{success}</p>}
            <button type="submit">Register</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
