import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import JobsDashboard from "./pages/Jobs";
import Gallery from "./pages/Gallery.jsx";
import Batches from "./pages/Batches";
import ManageUsers from "./pages/manageUsers";
import Users from "./pages/Users";
import AdminLogin from "./pages/adminLogin/adminLogin";
import CreateAdmin from "./createAdmin/createAdmin";
import Posts from "./pages/posts";
import AlumniForms from "./pages/AlumniForms";
import AlumniUpdates from "./pages/AlumniUpdates";
import JobDetail from "./pages/JobDetail";

const App = () => {
  const [admin, setAdmin] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    setAdmin(null);
  };

  useEffect(() => {
    // Restore session from localStorage on first load
    const token = localStorage.getItem("adminToken");
    if (token) setAdmin(true);

    // Global axios interceptor — catches expired/invalid tokens on any API call
    // and automatically logs the admin out instead of silently failing
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          // Token is expired or invalid — clear session and redirect to login
          handleLogout();
        }
        return Promise.reject(error);
      }
    );

    // Clean up the interceptor when the component unmounts
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const handleLogin = (adminData) => {
    setAdmin(adminData);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={!admin ? <AdminLogin onLogin={handleLogin} /> : <Navigate to="/" />}
        />
        <Route
          path="/*"
          element={
            admin ? (
              <div style={{ display: "flex" }}>
                <Sidebar />
                <div style={{ flexGrow: 1, marginLeft: "200px" }}>
                  <Navbar onLogout={handleLogout} />
                  <main style={{ padding: "1rem", marginTop: "64px" }}>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/users" element={<Users />} />
                      <Route path="/jobs" element={<JobsDashboard />} />
                      <Route path="/jobs/:id" element={<JobDetail />} />
                      <Route path="/posts" element={<Posts />} />
                      <Route path="/gallery" element={<Gallery />} />
                      <Route path="/batches" element={<Batches />} />
                      <Route path="/create-admin" element={<CreateAdmin />} />
                      <Route path="/manageUsers" element={<ManageUsers />} />
                      <Route path="/alumni-forms" element={<AlumniForms />} />
                      <Route path="/alumni-updates" element={<AlumniUpdates />} />
                    </Routes>
                  </main>
                </div>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;