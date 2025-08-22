import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Select from "react-select"; // Import react-select
import "./loginform.scss";
import axios from "axios";

const options = [
  { value: "student", label: "Student" },
  { value: "alumni", label: "Alumni" },
  { value: "faculty", label: "Faculty" },
];

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    background: "white",
    borderRadius: 20,
    marginTop: "15px",
    padding: "10px 20px",
    border: "none",
    boxShadow: "#cff0ff 0px 10px 10px -5px;",
    fontSize: "1rem",
    cursor: "pointer",
    borderInline: "2px solid transparent",
    transition: "all 0.3s ease",
    "&:hover": {
      borderColor: "#1089d3",
    },
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: 20,
    marginTop: "5px",
    backgroundColor: "white",
    animation: "fadeInDown 0.3s ease",
  }),
  option: (provided, state) => ({
    ...provided,
    color: "black",
    borderRadius: 20,
    cursor: "pointer",
    padding: "10px 20px",
    overflow: "hidden",
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#aaa",
    marginLeft: 0,
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#1089d3",
    marginLeft: 0,
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    paddingRight: "10px",
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: "#1089d3",
    "&:hover": {
      color: "#12b1d1",
    },
  }),
};

export const RegisterForm = () => {
  const [inputs, setInputs] = useState({
    email: "",
    enrollmentNo: "",
    password: "",
    name: "",
    role: "",
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

  const handleSelectChange = (selectedOption) => {
    setInputs((prev) => ({
      ...prev,
      role: selectedOption ? selectedOption.value : "",
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

      setSuccess("Registration successful. Account activated.");
      setInputs({
        email: "",
        enrollmentNo: "",
        password: "",
        name: "",
        role: "",
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

  // Finding selected role option
  const selectedRoleOption =
    options.find((opt) => opt.value === inputs.role) || null;

  return (
    <div className="login-page">
      <div className="login-wrapper">
        <div className="container">
          <button className="close-btn" onClick={handleClose}>
            ×
          </button>
          <div className="heading">Register</div>

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
            <Link to="/forgot-Enrollment" className="forgot-link">
              Forgot Enrollment Number?
            </Link>
            <input
              required
              className="input"
              type="password"
              name="password"
              placeholder="Password"
              value={inputs.password}
              onChange={handleChange}
            />

            <Select
              options={options}
              value={selectedRoleOption}
              onChange={handleSelectChange}
              placeholder="Role"
              styles={customStyles}
              isSearchable={false}
              name="role"
              classNamePrefix="custom-select"
            />

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


