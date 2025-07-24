import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Events from "./pages/Events";
import Dashboard from "./pages/Dashboard";
import JobsDashboard from "./pages/Jobs";
import Gallery from "./pages/Gallery.jsx";
import Batches from "./pages/Batches";
import ManageUsers from "./pages/manageUsers";
import Users from "./pages/Users";
import AdminLogin from "./pages/adminLogin/adminLogin";
import CreateAdmin from "./createAdmin/createAdmin";
import Posts from "./pages/posts"; // ✅ Correct import

const App = () => {
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) setAdmin(true);
  }, []);

  const handleLogin = (adminData) => {
    setAdmin(adminData);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    setAdmin(null);
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
                      <Route path="/posts" element={<Posts />} /> {/* ✅ Added Posts route */}
                      <Route path="/events" element={<Events />} />
                      <Route path="/gallery" element={<Gallery />} />
                      <Route path="/batches" element={<Batches />} />
                      <Route path="/create-admin" element={<CreateAdmin />} />
                      <Route path="/manageUsers" element={<ManageUsers />} />
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
