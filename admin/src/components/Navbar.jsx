import React, { useState, useRef, useEffect } from "react";
import "./navbar.scss";
import { FaUserCircle } from "react-icons/fa";
import UploadForm from "../uploadForm/UploadForm"; // adjust path as needed

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const dropdownRef = useRef();

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
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
                    setShowForm(true);
                    setDropdownOpen(false); // close dropdown
                  }}
                >
                  Update User Data
                </span>
                <span className="dropdown-item">Create Admin</span>
                <span className="dropdown-item">Logout</span>
              </div>
            )}
          </div>
        </div>
      </nav>

      {showForm && <UploadForm onClose={() => setShowForm(false)} />}
    </>
  );
};

export default Navbar;
