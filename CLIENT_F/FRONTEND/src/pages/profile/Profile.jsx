import { useParams } from "react-router-dom";
import "./profile.scss";
import {
  FacebookTwoTone as FacebookTwoToneIcon,
  LinkedIn as LinkedInIcon,
  Instagram as InstagramIcon, 
  Twitter as TwitterIcon,
  Place as PlaceIcon,
  Language as LanguageIcon,
  EmailOutlined as EmailOutlinedIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import Posts from "../../components/posts/Posts";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";

const Profile = () => {
  const { id } = useParams(); // Access the dynamic id from the URL
  const { currentUser } = useContext(AuthContext);

  return (
    <div className="profile">
      <div className="images">
        {/* Display cover and profile images */}
        <img
          src="https://images.pexels.com/photos/13440765/pexels-photo-13440765.jpeg"
          alt=""
          className="cover"
        />
        {/* If profilePic is available, use it, otherwise fallback to default image */}
        <img
          src={currentUser?.profilePic || "/default-profile.jpg"}
          alt="Profile"
          className="profilePic"
        />
      </div>
      <div className="profileContainer">
        <div className="uInfo">
          <div className="left">
            {/* Added links to social media */}
            <a href="http://facebook.com"><FacebookTwoToneIcon fontSize="large" /></a>
            <a href="http://instagram.com"><InstagramIcon fontSize="large" /></a>
            <a href="http://twitter.com"><TwitterIcon fontSize="large" /></a>
            <a href="http://linkedin.com"><LinkedInIcon fontSize="large" /></a>
            
          </div>
          <div className="center">
            {/* Display current user's name, or "Guest" if no name available */}
            <span>{currentUser?.name || "Guest"}</span>
            <div className="info">
              {/* Display user's country and language */}
              <div className="item"><PlaceIcon /><span>India</span></div>
              <div className="item"><LanguageIcon /><span>English</span></div>
            </div>
            <button>Follow</button>
          </div>
          <div className="right">
            <EmailOutlinedIcon />
            <MoreVertIcon />
          </div>
        </div>
        {/* Rendering Posts component */}
        <Posts />
      </div>
    </div>
  );
};

export default Profile;
