import React, { useEffect, useState } from "react";
import "./people.scss";
import defaultPic from "../../assets/profile.jpg";
import { useChatStore } from "../messages/store/useChatStore";
import { useNavigate } from "react-router-dom";
import {
  FacebookTwoTone as FacebookTwoToneIcon,
  LinkedIn as LinkedInIcon,
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
  Message as MessageIcon,
} from "@mui/icons-material";

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
  const [searchTerm, setSearchTerm] = useState("");
  const { setSelectedUser: openChatWithUser } = useChatStore();
  const navigate = useNavigate();

  useEffect(() => {
    preloadSkeletonCount();
  }, []);

  const preloadSkeletonCount = async () => {
    try {
      const res = await fetch("https://skill-sync-backend-522o.onrender.com/API_B/users/users", {
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
  const handleViewProfile = (user) => {
    closePopup();
    navigate(`/profile/${user._id}`);
  };
  const handleMessage = (user) => {
    openChatWithUser(user);
    navigate("/messages");
  };
  const getProfilePic = (pic) => {
    if (pic && pic.trim() !== "") {
      return pic.startsWith("http")
        ? pic
        : `https://skill-sync-backend-522o.onrender.com${pic}`;
    }
    return defaultPic;
  };

  // Combine name, branch, and batch into one searchable string
  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(term) ||
      user.branch?.toLowerCase().includes(term) ||
      user.batch?.toString().toLowerCase().includes(term)
    );
  });

  return (
    <div className="people-section">
      <div className="people-header">
        <h2>People</h2>
        <input
          type="text"
          placeholder="Search by name, branch or batch..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="user-grid">
        {loading
          ? Array.from({ length: skeletonCount }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))
          : filteredUsers.map((user) => (
              <div className="user-card" key={user._id}>
                <div className="card-left">
                  <img
                    src={getProfilePic(user.profilePic)}
                    alt="Profile"
                    className="profile-pic"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = defaultPic;
                    }}
                  />
                </div>
                <div className="card-right">
                  <p>
                    <strong>Name:</strong> {user.name}
                  </p>
                  <p>
                    <strong>Branch:</strong> {user.branch}
                  </p>
                  <p>
                    <strong>Batch:</strong> {user.batch}
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
            <button className="close-btn" onClick={closePopup}>
              ✖
            </button>
            <img
              src={getProfilePic(selectedUser.profilePic)}
              alt="Profile"
              className="popup-profile-pic"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultPic;
              }}
            />
            <h3>{selectedUser.name}</h3>
            <div className="popup-row">
              <p className="left">
                <strong>Email:</strong> {selectedUser.email}
              </p>
              <p className="right">
                <strong>Branch:</strong> {selectedUser.branch}
              </p>
            </div>
            <p>
              <strong>Batch:</strong> {selectedUser.batch}
            </p>
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
                <a
                  href={selectedUser.linkedin}
                  target="_blank"
                  rel="noreferrer"
                >
                  <LinkedInIcon fontSize="large" />
                </a>
              )}
              {selectedUser.facebook && (
                <a
                  href={selectedUser.facebook}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FacebookTwoToneIcon fontSize="large" />
                </a>
              )}
              {selectedUser.instagram && (
                <a
                  href={selectedUser.instagram}
                  target="_blank"
                  rel="noreferrer"
                >
                  <InstagramIcon fontSize="large" />
                </a>
              )}
              {selectedUser.twitter && (
                <a
                  href={selectedUser.twitter}
                  target="_blank"
                  rel="noreferrer"
                >
                  <TwitterIcon fontSize="large" />
                </a>
              )}
              <button className="btn" onClick={() => handleMessage(selectedUser)}>
                <MessageIcon fontSize="large" />
              </button>
            </div>
            <div className="popup-buttons">
              <button onClick={() => handleViewProfile(selectedUser)}>
                View Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeopleSection;
