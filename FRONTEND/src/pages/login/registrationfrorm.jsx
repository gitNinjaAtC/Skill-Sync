import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './loginform.scss';
import axios from 'axios';

const RegisterForm = () => {
  const [inputs, setInputs] = useState({
    email: '',
    enrollmentNo: '',
    password: '',
    name: '',
    role: 'student',
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

    const handleClose = () => {
    navigate('/', { replace: true });
    window.location.reload(); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setSuccess(null);

    try {
      await axios.post(
        'https://skill-sync-backend-522o.onrender.com/API_B/auth/register',
        {          ...inputs        }
      );

      setSuccess('Registration successful. Awaiting admin approval.');
      setInputs({
        email: '',
        enrollmentNo: '',
        password: '',
        name: '',
        role: 'student',
      });

      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const message =
        typeof err?.response?.data === 'string'
          ? err.response.data
          : err?.response?.data?.error ||
            err?.response?.data?.message ||
            'Registration failed. Please try again.';
      setErr(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="container">
        <button className="close-btn" onClick={handleClose}>×</button>
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
            required
            className="input"
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

          <select
            name="role"
            className="input"
            value={inputs.role}
            onChange={handleChange}
            required
          >
            <option value="student">Student</option>
            <option value="alumni">Alumni</option>
            <option value="faculty">Faculty</option>
            <option value="admin">Admin</option>
          </select>

          {err && <p className="error">{err}</p>}
          {success && <p className="success">{success}</p>}

          <input
            className="login-button"
            type="submit"
            value={loading ? 'Registering...' : 'Register'}
            disabled={loading}
          />
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
