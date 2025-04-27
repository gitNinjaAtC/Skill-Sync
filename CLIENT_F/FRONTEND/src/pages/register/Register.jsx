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
  const navigate = useNavigate();

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErr(null); // Clear error on input change
    setSuccess(null); // Clear success message on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Registering with inputs:", inputs);
      const res = await axios.post(
        "http://localhost:8800/API_B/auth/register",
        inputs
      );
      console.log("Registration response:", res.data);
      setErr(null); // Clear any previous error
      setSuccess("User successfully created!"); // Set success message
      setInputs({ username: "", email: "", password: "", name: "" }); // Reset form
      setTimeout(() => {
        navigate("/login"); // Redirect to login after 2 seconds
      }, 2000);
    } catch (err) {
      console.error("Registration error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      const errorMessage =
        typeof err.response?.data === "string"
          ? err.response.data
          : err.response?.data?.message ||
            "Registration failed. Please try again.";
      setErr(errorMessage);
      setSuccess(null); // Clear success message on error
    }
  };

  return (
    <div className="register">
      <div className="card">
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
