import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./sidebar.scss";

const Sidebar = () => {
  const location = useLocation();

  // Function to check if the path is active
  const isActive = (path) => location.pathname === path;

  return (
    <div className="sidebar">
      <h2>Admin Panel</h2>
      <hr />
      <nav>
        <ul>
          <li>
            <Link to="/" className={isActive("/") ? "active" : ""}>Dashboard</Link>
          </li>
          <li>
            <Link to="/users" className={isActive("/users") ? "active" : ""}>Users</Link>
          </li>
          <li>
            <Link to="/jobs" className={isActive("/jobs") ? "active" : ""}>Job</Link>
          </li>
          <li>
            <Link to="/posts" className={isActive("/posts") ? "active" : ""}>Posts</Link>
          </li>
          <li>
            <Link to="/gallery" className={isActive("/gallery") ? "active" : ""}>Gallery</Link>
          </li>
          <li>
            <Link to="/batches" className={isActive("/batches") ? "active" : ""}>Batches</Link>
          </li>
          <li>
            <Link to="/manageUsers" className={isActive("/manageUsers") ? "active" : ""}>Registration Approval</Link>
          </li>
          <li>
            <Link to="/reports" className={isActive("/reports") ? "active" : ""}>Report</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
