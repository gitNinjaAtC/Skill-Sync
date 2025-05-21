import "./navbar.scss";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { DarkModeContext } from "../../context/darkModeContext";
import { AuthContext } from "../../context/authContext";

const Navbar = () => {
  const { toggle, darkMode } = useContext(DarkModeContext);
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err.response?.data || err.message);
    }
  };

  const handleProfile = () => {
    navigate(`/profile/${currentUser?.id}`);
  };

  return (
    <>
      <div className="navbar">
        <div className="left">
          {/* Hamburger Menu Icon for Mobile */}
          <div className="hamburgerMenu" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </div>

          <Link to="/" className="logo">SISTec</Link>

          <div className="mobileSearchIcon" onClick={() => setMobileSearchOpen(true)}>
            <SearchOutlinedIcon />
          </div>
        </div>

        <div className="center">
          <div className="search">
            <SearchOutlinedIcon />
            <input type="text" placeholder="Search..." />
          </div>
        </div>

        <div className="right">
          <Link to="/" className="homeIconWrapper">
            <HomeOutlinedIcon className="homeIcon" />
          </Link>

          {darkMode ? (
            <WbSunnyOutlinedIcon onClick={toggle} className="themeIcon" />
          ) : (
            <DarkModeOutlinedIcon onClick={toggle} className="themeIcon" />
          )}

          <div className="rightIconsDesktop">
            <button className="profile-button" onClick={handleProfile}>
              <PersonOutlinedIcon />
            </button>
            <EmailOutlinedIcon />
            <NotificationsOutlinedIcon />
          </div>

          <div className="user">
            <img src={currentUser?.profilePic} alt="Profile" />
            <span>{currentUser?.name}</span>
            {currentUser && (
              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {mobileSearchOpen && (
        <div className="mobileSearchOverlay">
          <div className="mobileSearchContainer">
            <SearchOutlinedIcon />
            <input
              type="text"
              placeholder="Search..."
              autoFocus
              onBlur={() => setMobileSearchOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Mobile Sidebar Placeholder (Replace with actual sidebar if needed) */}
      {mobileMenuOpen && (
        <div className="mobileSidebar">
          <p>Sidebar content here...</p>
        </div>
      )}
    </>
  );
};

export default Navbar;
