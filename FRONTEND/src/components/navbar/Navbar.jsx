import "./navbar.scss";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
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
import defaultAvatar from "../../assets/profile.jpg";
import home from "../../assets/home.png";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../context/authContext";

const Navbar = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const avatarRef = useRef(null);
  const sidebarRef = useRef(null);

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

  const closedropdownAndNavigate = (path) => {
    navigate(path);
    setUserDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutsideSidebar = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        mobileMenuOpen
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutsideSidebar);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideSidebar);
    };
  }, [mobileMenuOpen]);

  // 👇 For mobile menu items: navigate & close sidebar
  const closeSidebarAndNavigate = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err.response?.data || err.message);
    }
  };

  const handleProfile = () => {
    closedropdownAndNavigate(`/profile/${currentUser?.id}`);
  };

  const isActive = (path) => location.pathname === path;

  const getProfilePicUrl = () => {
    if (!currentUser?.profilePic || currentUser.profilePic.trim() === "")
      return defaultAvatar;
    return currentUser.profilePic.startsWith("http")
      ? currentUser.profilePic
      : `https://skill-sync-backend-522o.onrender.com${currentUser.profilePic}`;
  };

  return (
    <>
      <div className="navbar">
        <div className="left">
          <div
            className="hamburgerMenu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </div>

          <Link to="/home" className="logo">
            SISTec
          </Link>

          <div
            className="mobileSearchIcon"
            onClick={() => setMobileSearchOpen(true)}
          >
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
          <Link
            to="/home"
            className={`homeIconWrapper ${isActive("/home") ? "active" : ""}`}
          >
            <HomeOutlinedIcon className="homeIcon" />
          </Link>

          <div className="rightIconsDesktop">
            <button
              className={`profile-button ${
                isActive(`/profile/${currentUser?.id}`) ? "active" : ""
              }`}
              onClick={handleProfile}
            >
              <PersonOutlinedIcon />
            </button>
            <Link
              to="#"
              className={`iconWrapper ${isActive("#") ? "active" : ""}`}
            >
              <EmailOutlinedIcon className="mailIcon" />
            </Link>

            <Link
              to="#"
              className={`iconWrapper ${isActive("#") ? "active" : ""}`}
            >
              <NotificationsOutlinedIcon className="notificationIcon" />
            </Link>
          </div>

          <div className="user">
            <img
              src={getProfilePicUrl()}
              alt="Profile"
              className="profile-pic"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              ref={avatarRef}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultAvatar;
              }}
            />

            {userDropdownOpen && (
              <div className="user-dropdown" ref={dropdownRef}>
                <div className="dropdown-header">
                  <img
                    src={getProfilePicUrl()}
                    alt="Profile"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = defaultAvatar;
                    }}
                  />
                  <span>{currentUser?.name}</span>
                </div>
                <div className="dropdown-item" onClick={handleProfile}>
                  <PersonOutlinedIcon />
                  <span>Your Profile</span>
                </div>
                <div className="dropdown-item" onClick={handleProfile}>
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
        <div className="mobileSidebar" ref={sidebarRef}>
          <div className="container">
            <div className="menu">
              <div className="user">
                <button
                  className={`profile-button ${
                    isActive(`/profile/${currentUser?.id}`) ? "active" : ""
                  }`}
                  onClick={handleProfile}
                >
                  <img
                    src={getProfilePicUrl()}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = defaultAvatar;
                    }}
                    alt="User"
                  />
                  <span
                    className={`${
                      isActive(`/profile/${currentUser?.id}`) ? "active" : ""
                    }`}
                    onClick={() => closeSidebarAndNavigate({ handleProfile })}
                  >
                    {currentUser?.name}
                    <br />
                    <span className="role">{currentUser?.role}</span>
                  </span>
                </button>
              </div>

              <div
                className={`item ${isActive("/home") ? "active" : ""}`}
                onClick={() => closeSidebarAndNavigate("/home")}
              >
                <img src={home} alt="Home" />
                <span>Home</span>
              </div>
              {currentUser?.role?.toLowerCase() === "alumni" && (
                <div
                  className={`item ${
                    isActive("/alumni-form") ? "active" : ""
                  }`}
                  onClick={() => closeSidebarAndNavigate("/alumni-form")}
                >
                  <img src={Events} alt="Alumni Meet" />
                  <span>Alumni Meet</span>
                </div>
              )}
              <div
                className={`item ${isActive("/people") ? "active" : ""}`}
                onClick={() => closeSidebarAndNavigate("/people")}
              >
                <img src={Friends} alt="Friends" />
                <span>People</span>
              </div>
              <div
                className={`item ${isActive("/forums") ? "active" : ""}`}
                onClick={() => closeSidebarAndNavigate("/forums")}
              >
                <img src={Forums} alt="Forums" />
                <span>Forums</span>
              </div>
              <div
                className={`item ${isActive("/job") ? "active" : ""}`}
                onClick={() => closeSidebarAndNavigate("/job")}
              >
                <img src={Jobs} alt="Jobs" />
                <span>Jobs</span>
              </div>
              <div
                className={`item ${isActive("/events") ? "active" : ""}`}
                onClick={() => closeSidebarAndNavigate("/events")}
              >
                <img src={Events} alt="Events" />
                <span>Events</span>
              </div>
              <div
                className={`item ${isActive("/gallery") ? "active" : ""}`}
                onClick={() => closeSidebarAndNavigate("/gallery")}
              >
                <img src={Gallery} alt="Gallery" />
                <span>Gallery</span>
              </div>
              <div
                className={`item ${isActive("/messages") ? "active" : ""}`}
                onClick={() => closeSidebarAndNavigate("/messages")}
              >
                <img src={Messages} alt="Messages" />
                <span>Messages</span>
              </div>
            </div>

            <hr />

            <div className="menu">
              <span>Others</span>
              <div
                className={`item ${isActive("/Fundraiser") ? "active" : ""}`}
                onClick={() => closeSidebarAndNavigate("/Fundraiser")}
              >
                <img src={Fund} alt="Fundraiser" />
                <span>Collaborate</span>
              </div>
              <div
                className={`item ${
                  isActive("/resume-builder") ? "active" : ""
                }`}
                onClick={() => closeSidebarAndNavigate("/resume-builder")}
              >
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
