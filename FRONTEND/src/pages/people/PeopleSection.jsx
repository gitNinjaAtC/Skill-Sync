import React, { useEffect, useState } from "react";
import "./people.scss";
import defaultPic from "../../assets/profile.jpg";
import { useChatStore } from "../messages/store/useChatStore";
import { useNavigate } from "react-router-dom"; // ✅ New import

const SkeletonCard = () => (
  <div className="user-card skeleton-card">
    <div className="card-left">
      <div className="skeleton skeleton-img"></div>
    </div>
    <div className="card-right">
      <div className="skeleton skeleton-text short"></div>
      <div className="skeleton skeleton-text medium"></div>
      <div className="skeleton-buttons">
        <div className="skeleton-button"></div>
        <div className="skeleton-button"></div>
      </div>
    </div>
  </div>
);

const PeopleSection = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [skeletonCount, setSkeletonCount] = useState(12);
  const { setSelectedUser: openChatWithUser } = useChatStore();
  const navigate = useNavigate(); // ✅ Hook

  useEffect(() => {
    preloadSkeletonCount();
  }, []);

  const preloadSkeletonCount = async () => {
    try {
      const res = await fetch("http://localhost:8800/API_B/users/users", {
        credentials: "include",
      });
      const data = await res.json();

      setSkeletonCount(data.length || 12);
      setTimeout(() => {
        setUsers(data);
        setLoading(false);
      }, 200);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setLoading(false);
    }
  };

  const handleView = (user) => setSelectedUser(user);
  const closePopup = () => setSelectedUser(null);

  const handleMessage = (user) => {
    openChatWithUser(user);        // ✅ Set selected user in chat store
    navigate("/messages");         // ✅ Navigate to messages route
  };

  return (
    <div className="people-section">
      <h2>People</h2>
      <div className="user-grid">
        {loading
          ? Array.from({ length: skeletonCount }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))
          : users.map((user) => (
              <div className="user-card" key={user._id}>
                <div className="card-left">
                  <img
                    src={user.profilePic || defaultPic}
                    alt="Profile"
                    className="profile-pic"
                    onError={(e) => (e.target.src = defaultPic)}
                  />
                </div>
                <div className="card-right">
                  <p>
                    <strong>Name:</strong> {user.name}
                  </p>
                  <p>
                    <strong>Role:</strong> {user.role}
                  </p>
                  <div className="card-buttons">
                    <button onClick={() => handleView(user)}>View</button>
                    <button onClick={() => handleMessage(user)}>Message</button>
                  </div>
                </div>
              </div>
            ))}
      </div>

      {selectedUser && (
        <div className="popup-overlay">
          <div className="popup-card">
            <img
              src={selectedUser.profilePic || defaultPic}
              alt="Profile"
              className="popup-profile-pic"
              onError={(e) => (e.target.src = defaultPic)}
            />
            <h3>{selectedUser.name}</h3>
            <p>
              <strong>Email:</strong> {selectedUser.email}
            </p>
            <p>
              <strong>Role:</strong> {selectedUser.role}
            </p>
            {selectedUser.about && (
              <p>
                <strong>About:</strong> {selectedUser.about}
              </p>
            )}
            {selectedUser.skills && (
              <p>
                <strong>Skills:</strong>{" "}
                {Array.isArray(selectedUser.skills)
                  ? selectedUser.skills.join(", ")
                  : selectedUser.skills}
              </p>
            )}
            {selectedUser.education && (
              <p>
                <strong>Education:</strong> {selectedUser.education}
              </p>
            )}
            {selectedUser.experience && (
              <p>
                <strong>Experience:</strong> {selectedUser.experience}
              </p>
            )}

            <div className="popup-links">
              {selectedUser.linkedin && (
                <a href={selectedUser.linkedin} target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
              )}
              {selectedUser.facebook && (
                <a href={selectedUser.facebook} target="_blank" rel="noreferrer">
                  Facebook
                </a>
              )}
              {selectedUser.instagram && (
                <a href={selectedUser.instagram} target="_blank" rel="noreferrer">
                  Instagram
                </a>
              )}
              {selectedUser.twitter && (
                <a href={selectedUser.twitter} target="_blank" rel="noreferrer">
                  Twitter
                </a>
              )}
            </div>

            <div className="popup-buttons">
              <button onClick={() => handleMessage(selectedUser)}>Message</button>
              <button onClick={closePopup}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeopleSection;
