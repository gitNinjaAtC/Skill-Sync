import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import "./login.scss";

const Login = () => {
  const [inputs, setInputs] = useState({
    username: "",
    password: "",
  });

  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, currentUser } = useContext(AuthContext);

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErr(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const user = await login(inputs);

      if (!user?.isActive) {
        setErr("Your account is not yet approved by admin.");
        return;
      }
    } catch (err) {
      const errorMessage =
        typeof err === "string"
          ? err
          : err?.response?.data?.error ||
            err?.message ||
            "Login failed. Please try again.";
      setErr(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.isActive) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  return (
    <div className="login">
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Logging in, please wait...</p>
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
          <span>Don't have an account?</span>
          <Link to="/register">
            <button className="btn-secondary">Register</button>
          </Link>
        </div>

        <div className="right">
          <h1>Login</h1>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              name="username"
              onChange={handleChange}
              value={inputs.username}
              required
            />
            <input
              type="password"
              placeholder="Password"
              name="password"
              onChange={handleChange}
              value={inputs.password}
              required
            />

            <div className="form-footer">
              <span>
                Forgot your password?{" "}
                <Link to="/forgot-password" className="forgot-link">
                  Click here
                </Link>
              </span>

              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>

            {err && <p className="error">{err}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
