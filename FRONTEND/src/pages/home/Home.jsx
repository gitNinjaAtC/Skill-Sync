import { useContext } from "react";
import { AuthContext } from "../../context/authContext";
import Posts from "../../components/posts/Posts";
import Share from "../../components/share/Share";
import "./home.scss";
import home from "../../assets/home.png";

const Home = () => {
  const { currentUser } = useContext(AuthContext);

  return (
    <div className="home-wrapper">
      <div className="home-container">
        <div className="home-header">
          <img src={home} alt="post" className="home-icon" />
          <span className="home-title">Home</span>
        </div>
      </div>

      <div className="home">
        {currentUser && ["admin", "alumni", "faculty"].includes(currentUser.role) && (
          <Share />
        )}

        <Posts />
      </div>
    </div>
  );
};

export default Home;
