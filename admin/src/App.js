import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Events from "./pages/Events";
import Dashboard from "./pages/Dashboard";
import JobsDashboard from "./pages/Jobs";
import Gallery from "./pages/Gallery";
import ManageUsers from "./pages/manageUsers";
import Users from "./pages/Users";

const App = () => {
  return (
    <Router>
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div style={{ flexGrow: 1, marginLeft: "200px" }}>
          <Navbar />
          <main style={{ padding: "1rem", marginTop: "64px" }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/jobs" element={<JobsDashboard />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/events" element={<Events />} />
              <Route path="/manageUsers" element={<ManageUsers />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
