import Posts from "../../components/posts/Posts";
import Share from "../../components/share/Share";
import "./home.scss";
import home from "../../assets/home.png";

const Home = () => {
  return (
    <>
      <div className="home-wrapper">
      <div className="home-container">
        <div className="home-header">
          <img src={home} alt="post" className="home-icon" />
          <span className="home-title">Home</span>
        </div>
      </div>

      <div className="home">
        <Share />
        <Posts />
      </div>
    </div>

    </>
  );
};

export default Home;
