import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import Posts from "../../components/posts/Posts";
import Share from "../../components/share/Share";
import "./home.scss";
import home from "../../assets/home.png";
import axios from "axios";

const Home = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showAd, setShowAd] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if alumni has submitted the form
  useEffect(() => {
    if (currentUser && currentUser.role === "alumni") {
      axios.get("https://skill-sync-backend-522o.onrender.com/API_B/alumni/form", {
        withCredentials: true
      })
      .then(res => {
        if (!res.data.form) {
          setShowAd(true);
        }
      })
      .catch(err => {
        console.error("Error checking alumni form status", err);
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const handleAdClick = () => {
    navigate("/alumni-form");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

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

        {currentUser && currentUser.role === "alumni" && showAd && (
          <div className="alumni-ad-popup" onClick={handleAdClick}>
            <p>🎓 Don’t forget to fill your Alumni Meet form!</p>
            <span>Click here to complete it now</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
