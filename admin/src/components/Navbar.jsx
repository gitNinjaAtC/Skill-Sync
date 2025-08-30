import React, { useState, useRef, useEffect } from "react";
import "./navbar.scss";
import { FaUserCircle } from "react-icons/fa";
import CreateAdmin from "../createAdmin/createAdmin"; // Adjust path if needed
import { useNavigate } from "react-router-dom";

const Navbar = ({ onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const dropdownRef = useRef();
  const navigate = useNavigate();

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleLogout = () => {
    if (onLogout) onLogout();
    setDropdownOpen(false);
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className="navbar">
        <div className="container">
          <h1 className="logo">SISTec Alumni Portal</h1>

          <div className="right-section" ref={dropdownRef}>
            <FaUserCircle className="profile-icon" onClick={toggleDropdown} />
            {dropdownOpen && (
              <div className="dropdown-menu">               
                <span
                  className="dropdown-item"
                  onClick={() => {
                    setShowAdminForm(true);
                    setDropdownOpen(false);
                  }}
                >
                  Create Admin
                </span>

                <span className="dropdown-item" onClick={handleLogout}>
                  Logout
                </span>
              </div>
            )}
          </div>
        </div>
      </nav>
      
      {showAdminForm && <CreateAdmin onClose={() => setShowAdminForm(false)} />}
    </>
  );
};

export default Navbar;
