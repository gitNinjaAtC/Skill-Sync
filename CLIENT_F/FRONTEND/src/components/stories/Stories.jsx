import { useContext } from "react";
import "./stories.scss";
import { AuthContext } from "../../context/authContext";

const Stories = () => {
  const { currentUser } = useContext(AuthContext);

  //TEMPORARY
  const stories = [
    {
      id: 1,
      name: "Zahra Hussain",
      img: "https://images.pexels.com/photos/853168/pexels-photo-853168.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    {
      id: 2,
      name: "Purushottam Kumar Mandal",
      img: "https://images.pexels.com/photos/1136575/pexels-photo-1136575.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    {
      id: 3,
      name: "Shivam",
      img: "https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
  ];

  return (
    <div className="stories">
      <div className="story">
        <img src={currentUser.profilePic} alt="" />
        <span>{currentUser.name}</span>
        <button>+</button>
      </div>
      {stories.map((story) => (
        <div className="story" key={story.id}>
          <img src={story.img} alt="" />
          <span>{story.name}</span>
        </div>
      ))}
    </div>
  );
};

export default Stories;
