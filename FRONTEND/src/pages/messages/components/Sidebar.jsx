import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../../../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";
import avatar from "../../../assets/avatar.png";
import "./sidebar.scss";

const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
  } = useChatStore();

  const { onlineUsers, authUser: currentUser } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("faculty"); // toggle between "faculty" and "students"

  useEffect(() => {
    getUsers();
  }, []);

  // Exclude admins
  const nonAdminUsers = users.filter(
    (user) => user.role?.toLowerCase() !== "admin"
  );

  // Apply online filter if needed
  const onlineFilteredUsers = showOnlineOnly
    ? nonAdminUsers.filter((user) =>
        onlineUsers.includes(user._id?.toString())
      )
    : nonAdminUsers;

  // Apply search filter
  const filteredUsers = onlineFilteredUsers.filter((user) =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Split into faculty vs. students
  const facultyUsers = filteredUsers.filter(
    (user) => user.role?.toLowerCase() === "faculty"
  );
  const studentUsers = filteredUsers.filter(
    (user) => user.role?.toLowerCase() !== "faculty"
  );

  const resolveProfilePic = (user) => {
    if (!user?.profilePic || user.profilePic.trim() === "") return avatar;
    return user.profilePic.startsWith("http")
      ? user.profilePic
      : `https://skill-sync-backend-522o.onrender.com${user.profilePic}`;
  };

  if (isUsersLoading) return <SidebarSkeleton />;

  const renderUser = (user) => {
    const isOnline = onlineUsers.includes(user._id?.toString());
    const isCurrentUser = user._id?.toString() === currentUser?._id?.toString();

    return (
      <button
        key={user._id}
        onClick={() => setSelectedUser(user)}
        className={`contact-item ${selectedUser?._id === user._id ? "selected" : ""}`}
      >
        <div className="contact-content">
          <div className="avatar-wrapper">
            <img
              src={resolveProfilePic(user)}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = avatar;
              }}
              alt="avatar"
              className="avatar"
            />
            {isOnline && <span className="online-dot" />}
          </div>
          <div className="user-info">
            <div className="name">
              {user.name}{" "}
              {isCurrentUser && <strong style={{ color: "#4A90E2" }}>(YOU)</strong>}
            </div>
            <div className="status">{isOnline ? "Online" : "Offline"}</div>
          </div>
        </div>
      </button>
    );
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="filter-row">
          <label className="filter-toggle">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
            />
            <span>Show online user</span>
          </label>
          <span className="online-count">({onlineUsers.length - 1} online)</span>
        </div>

        {/* Search Bar */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Single horizontal line separating header & tabs + contact list */}
      <hr className="divider" />

      {/* Tabs sit immediately below the horizontal line */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === "faculty" ? "active" : ""}`}
          onClick={() => setActiveTab("faculty")}
        >
          Faculty
        </button>
        <button
          className={`tab ${activeTab === "students" ? "active" : ""}`}
          onClick={() => setActiveTab("students")}
        >
          Students
        </button>
      </div>

      <div className="contact-list">
        {activeTab === "faculty" &&
          (facultyUsers.length > 0 ? (
            facultyUsers.map(renderUser)
          ) : (
            <div className="no-users">
              {showOnlineOnly ? "No online faculty" : "No faculty found"}
            </div>
          ))}

        {activeTab === "students" &&
          (studentUsers.length > 0 ? (
            studentUsers.map(renderUser)
          ) : (
            <div className="no-users">
              {showOnlineOnly ? "No online students" : "No students found"}
            </div>
          ))}
      </div>
    </aside>
  );
};

export default Sidebar;