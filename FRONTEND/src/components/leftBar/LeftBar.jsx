import "./leftBar.scss";
import Friends from "../../assets/peoples.png";
import Forums from "../../assets/forums.png";
import Jobs from "../../assets/Job.png";
import Events from "../../assets/Events.png";
import GalleryIcon from "../../assets/gallery.png";
import Messages from "../../assets/message.png";
import Resume from "../../assets/11.png";
import Fund from "../../assets/13.png";
import defaultAvatar from "../../assets/profile.jpg";
import home from "../../assets/home.png";
import { AuthContext } from "../../context/authContext";
import { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const LeftBar = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleProfile = () => {
    if (currentUser?.id) {
      navigate(`/profile/${currentUser.id}`);
    }
  };

  const getProfilePic = () => {
    if (!currentUser?.profilePic || currentUser.profilePic.trim() === "") return defaultAvatar;
    return currentUser.profilePic.startsWith("http")
      ? currentUser.profilePic
      : `https://skill-sync-backend-522o.onrender.com${currentUser.profilePic}`;
  };

  return (
    <div className="leftBar">
      <div className="container">
        <div className="menu">
          <div className="user">
            <button
              className={`profile-button ${isActive(`/profile/${currentUser?.id}`) ? "active" : ""}`}
              onClick={handleProfile}
            >
              <img
                src={getProfilePic()}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultAvatar;
                }}
                alt="User"
              />
              <span>{currentUser?.name}</span>
            </button>
          </div>

          <div className={`item ${isActive("/home") ? "active" : ""}`} onClick={() => navigate("/home")}>
            <img src={home} alt="Home" />
            <span>Home</span>
          </div>
          <div className={`item ${isActive("/people") ? "active" : ""}`} onClick={() => navigate("/people")}>
            <img src={Friends} alt="Friends" />
            <span>People</span>
          </div>
          <div className={`item ${isActive("/forums") ? "active" : ""}`} onClick={() => navigate("/forums")}>
            <img src={Forums} alt="Forums" />
            <span>Forums</span>
          </div>
          <div className={`item ${isActive("/job") ? "active" : ""}`} onClick={() => navigate("/job")}>
            <img src={Jobs} alt="Jobs" />
            <span>Jobs</span>
          </div>
          <div className={`item ${isActive("/events") ? "active" : ""}`} onClick={() => navigate("/events")}>
            <img src={Events} alt="Events" />
            <span>Events</span>
          </div>
          <div className={`item ${isActive("/gallery") ? "active" : ""}`} onClick={() => navigate("/gallery")}>
            <img src={GalleryIcon} alt="Gallery" />
            <span>Gallery</span>
          </div>
          <div className={`item ${isActive("/messages") ? "active" : ""}`} onClick={() => navigate("/messages")}>
            <img src={Messages} alt="Messages" />
            <span>Messages</span>
          </div>
        </div>

        <hr />

        <div className="menu">
          <span>Others</span>
          <div className={`item ${isActive("/Fundraiser") ? "active" : ""}`} onClick={() => navigate("/Fundraiser")}>
            <img src={Fund} alt="Fundraiser" />
            <span>Fundraiser</span>
          </div>
          <div className={`item ${isActive("/resume-builder") ? "active" : ""}`} onClick={() => navigate("/resume-builder")}>
            <img src={Resume} alt="Resume Builder" />
            <span>Resume Builder</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftBar;
