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
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import Friends from "../../assets/peoples.png";
import Forums from "../../assets/forums.png";
import Jobs from "../../assets/Job.png";
import Events from "../../assets/Events.png";
import Gallery from "../../assets/gallery.png";
import Messages from "../../assets/message.png";
import Resume from "../../assets/11.png";
import Fund from "../../assets/13.png";
import profilePic from "../../assets/profile.jpg";
import home from "../../assets/home.png";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import { DarkModeContext } from "../../context/darkModeContext";
import { AuthContext } from "../../context/authContext";

const Navbar = () => {
  const { toggle, darkMode } = useContext(DarkModeContext);
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const avatarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        avatarRef.current &&
        !avatarRef.current.contains(event.target)
      ) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <div className="navbar">
        <div className="left">
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
          <Link to="/" className={`homeIconWrapper ${isActive("/") ? "active" : ""}`}>
            <HomeOutlinedIcon className="homeIcon" />
          </Link>

          {darkMode ? (
            <WbSunnyOutlinedIcon onClick={toggle} className="themeIcon" />
          ) : (
            <DarkModeOutlinedIcon onClick={toggle} className="themeIcon" />
          )}

          <div className="rightIconsDesktop">
            <button
              className={`profile-button ${isActive(`/profile/${currentUser?.id}`) ? "active" : ""}`}
              onClick={handleProfile}
            > 
              <PersonOutlinedIcon />
            </button>
            <Link to="#" className={`iconWrapper ${isActive("#") ? "active" : ""}`}>
              <EmailOutlinedIcon className="mailIcon"/>
            </Link>

            <Link to="#" className={`iconWrapper ${isActive("#") ? "active" : ""}`}>
              <NotificationsOutlinedIcon className="notificationIcon"/>
            </Link>

          </div>

          <div className="user">
            <img
              src={currentUser?.profilePic || profilePic}
              alt="Profile"
              className="profile-pic"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              ref={avatarRef}
            />

            {userDropdownOpen && (
              <div className="user-dropdown" ref={dropdownRef}>
                <div className="dropdown-header">
                  <img src={currentUser?.profilePic || profilePic} alt="Profile" />
                  <span>{currentUser?.name}</span>
                </div>
                <div className="dropdown-item" onClick={handleProfile}>
                  <PersonOutlinedIcon />
                  <span>Your Profile</span>
                </div>
                <div className="dropdown-item">
                  <SettingsIcon />
                  <span>Settings</span>
                </div>
                <div className="dropdown-item" onClick={handleLogout}>
                  <LogoutIcon />
                  <span>Logout</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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

      {mobileMenuOpen && (
        <div className="mobileSidebar">
          <div className="container">
            <div className="menu">
              <div className="user">
                <button className="profile-button" onClick={handleProfile}>
                  <img
                    src={currentUser?.profilePic || profilePic}
                    alt="User"
                  />
                  <span>{currentUser?.name}</span>
                </button>
              </div>
              <div className={`item ${isActive("/") ? "active" : ""}`} onClick={() => navigate("/")}>
                <img src={home} alt="Home" />
                <span>Home</span>
              </div>
              <div className={`item ${isActive("/friends") ? "active" : ""}`}>
                <img src={Friends} alt="Friends" />
                <span>Friends</span>
              </div>
              <div className={`item ${isActive("/forums") ? "active" : ""}`} onClick={() => navigate("/forums")}>                <img src={Forums} alt="Forums" />
                <span>Forums</span>
              </div>
              <div className={`item ${isActive("/job") ? "active" : ""}`} onClick={() => navigate("/job")}>                <img src={Jobs} alt="Jobs" />
                <span>Jobs</span>
              </div>
              <div className={`item ${isActive("/events") ? "active" : ""}`} onClick={() => navigate("/events")}>                <img src={Events} alt="Events" />
                <span>Events</span>
              </div>
              <div className="item">
                <img src={Gallery} alt="Gallery" />
                <span>Gallery</span>
              </div>
              <div className="item">
                <img src={Messages} alt="Messages" />
                <span>Messages</span>
              </div>
            </div>

            <hr />

            <div className="menu">
              <span>Others</span>
              <div className="item">
                <img src={Fund} alt="Fundraiser" />
                <span>Fundraiser</span>
              </div>
              <div className="item">
                <img src={Resume} alt="Resume Builder" />
                <span>Resume Builder</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
