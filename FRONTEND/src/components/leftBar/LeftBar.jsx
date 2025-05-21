import "./leftBar.scss";
import Friends from "../../assets/peoples.png";
import Forums from "../../assets/forums.png";
import Jobs from "../../assets/Job.png";
import Events from "../../assets/Events.png";
import Gallery from "../../assets/gallery.png";
import Messages from "../../assets/message.png";
import Resume from "../../assets/11.png";
import Fund from "../../assets/13.png";
import { AuthContext } from "../../context/authContext";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";

const LeftBar = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleProfile = () => {
    if (currentUser?.id) {
      navigate(`/profile/${currentUser.id}`);
    }
  };

  return (
    <div className="leftBar">
      <div className="container">
        <div className="menu">
          <div className="user">
            <button className="profile-button" onClick={handleProfile}>
              <img
                src={currentUser?.profilePic || "/defaultProfilePic.png"}
                alt="User"
              />
              <span>{currentUser?.name}</span>
            </button>
          </div>
          <div className="item">
            <img src={Friends} alt="Friends" />
            <span>Friends</span>
          </div>
          <div className="item" onClick={() => navigate("/forums")}>
            <img src={Forums} alt="Forums" />
            <span>Forums</span>
          </div>
          <div className="item" onClick={() => navigate("/job")}>
            <img src={Jobs} alt="Jobs" />
            <span>Jobs</span>
          </div>
          <div className="item" onClick={() => navigate("/events")}>
            <img src={Events} alt="Events" />
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
  );
};

export default LeftBar;
