import "./navbar.scss";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { DarkModeContext } from "../../context/darkModeContext";
import { AuthContext } from "../../context/authContext";

const Navbar = () => {
  const { toggle, darkMode } = useContext(DarkModeContext);
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err.response?.data || err.message);
    }
  };
  const handleProfile = async () => {
    try {
      await logout();
      navigate("/profile");
    } catch (err) {
      console.error("Profile error:", err.response?.data || err.message);
    }
  };

  return (
    <div className="navbar">
      <div className="left">
        <Link to="/" style={{ textDecoration: "none" }}>
          <span>SISTec</span>
        </Link>
        <HomeOutlinedIcon />
        {darkMode ? (
          <WbSunnyOutlinedIcon onClick={toggle} />
        ) : (
          <DarkModeOutlinedIcon onClick={toggle} />
        )}
        <GridViewOutlinedIcon />
      </div>
      <div className="center">
        <div className="search">
          <SearchOutlinedIcon />
          <input type="text" placeholder="Search..." />
        </div>
      </div>
      <div className="right">
        <button onClick={handleProfile}>
          <PersonOutlinedIcon />
        </button>

        <EmailOutlinedIcon />
        <NotificationsOutlinedIcon />
        <div className="user">
          <img src={currentUser?.profilePic} alt="" />
          <span>{currentUser?.name}</span>
          {currentUser && (
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
