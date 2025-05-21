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
  const navigate = useNavigate();
  const { login, currentUser } = useContext(AuthContext);

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr(null);
    try {
      await login(inputs);
      // Do not navigate here
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        "Login failed. Please try again.";
      setErr(errorMessage);
    }
  };

  // ✅ Navigate only when currentUser is set
  useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  return (
    <div className="login">
      <div className="card">
        <div className="left">
          <h1>SISTEC</h1>
          <p>
            Reconnect with classmates, explore career opportunities, and stay
            updated on events and achievements. Join a network that lasts a
            lifetime!
          </p>
          <span>Don't you have an account?</span>
          <Link to="/register">
            <button>Register</button>
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
            {err && <p className="error">{err}</p>}
            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
