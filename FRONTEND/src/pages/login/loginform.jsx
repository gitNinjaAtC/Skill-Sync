import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/authContext';
import './loginform.scss';

const Form = () => {
  const [inputs, setInputs] = useState({ email: '', password: '' });
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, currentUser } = useContext(AuthContext);

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErr(null);
  };

  const handleClose = () => {
    navigate('/', { replace: true });
    window.location.reload(); 
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    try {
      const res = await login(inputs); // ✅ get full Axios response
      const user = res.data;           // ✅ extract actual user object

      if (!user?.isActive) {
        setErr('Your account is not yet approved by admin.');
        return;
      }

      // successful login; redirect happens in useEffect
    } catch (err) {
      const errorMessage =
        typeof err === 'string'
          ? err
          : err?.response?.data?.error ||
            err?.message ||
            'Login failed. Please try again.';
      setErr(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.isActive) {
      navigate('/home');
    }
  }, [currentUser, navigate]);

  return (
    <div className="login-wrapper">
      <div className="container">
        <button className="close-btn" onClick={handleClose}>×</button>
        <div className="heading">Sign In</div>
        <form className="form" onSubmit={handleLogin}>
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
            type="password"
            name="password"
            placeholder="Password"
            value={inputs.password}
            onChange={handleChange}
          />

          <span className="forgot">
            <Link to="/forgot-password" className="forgot-link">
              Forgot Password ?
            </Link>
          </span>

          <input
            className="login-button"
            type="submit"
            value={loading ? 'Logging in...' : 'Sign In'}
            disabled={loading}
          />

          {err && <p className="error">{err}</p>}
        </form>
      </div>
    </div>
  );
};

export default Form;
