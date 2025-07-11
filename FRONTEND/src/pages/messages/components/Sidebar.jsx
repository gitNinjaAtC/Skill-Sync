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
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    console.log("All users fetched:", users);
    console.log("Online users:", onlineUsers);
  }, [users, onlineUsers]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(String(user._id)))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="header-top">
          <Users className="icon" />
          <span className="title">Contacts</span>
        </div>
        <div className="filter-row">
          <label className="filter-toggle">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
            />
            <span>Show online only</span>
          </label>
          <span className="online-count">({onlineUsers.length - 1} online)</span>
        </div>
      </div>

      <div className="contact-list">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => {
            const isOnline = onlineUsers.includes(String(user._id));
            return (
              <button
                key={user._id}
                onClick={() => setSelectedUser(user)}
                className={`contact-item ${selectedUser?._id === user._id ? "selected" : ""}`}
              >
                <div className="contact-content">
                  <div className="avatar-wrapper">
                    <img
                      src={user.profilePic || avatar}
                      alt="avatar"
                      className="avatar"
                    />
                    {isOnline && <span className="online-dot" />}
                  </div>
                  <div className="user-info">
                    <div className="name">{user.name}</div>
                    <div className="status">{isOnline ? "Online" : "Offline"}</div>
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          showOnlineOnly && <div className="no-users">No online users</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
