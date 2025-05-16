import "./leftBar.scss";
import Friends from "../../assets/1.png";
import Groups from "../../assets/2.png";
import Market from "../../assets/3.png";
import Memories from "../../assets/5.png";
import Events from "../../assets/6.png";
import Gallery from "../../assets/8.png";
import Videos from "../../assets/9.png";
import Messages from "../../assets/10.png";
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
            <img src={Groups} alt="Groups" />
            <span>Forums</span>
          </div>
          <div className="item" onClick={() => navigate("/job")}>
            <img src={Market} alt="Market" />
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
          <div className="item" >
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
