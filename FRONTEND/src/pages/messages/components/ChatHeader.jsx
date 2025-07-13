import { ArrowLeft } from "lucide-react";
import { useAuthStore } from "../../../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import avatar from "../../../assets/avatar.png";
import "./chatHeader.scss";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  const resolveProfilePic = (user) => {
    if (!user?.profilePic || user.profilePic.trim() === "") return avatar;
    return user.profilePic.startsWith("http")
      ? user.profilePic
      : `https://skill-sync-backend-522o.onrender.com${user.profilePic}`;
  };

  return (
    <div className="chat-header-container">
      <div className="chat-header-inner">
        <button className="close-btn" onClick={() => setSelectedUser(null)}>
          <ArrowLeft className="back-icon" />
        </button>

        <div className="user-info">
          <div className="avatar">
            <div className="avatar-img">
              <img
                src={resolveProfilePic(selectedUser)}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = avatar;
                }}
                alt={selectedUser?.name || "User"}
              />
            </div>
          </div>

          <div className="user-meta">
            <h3>{selectedUser?.name || "User"}</h3>
            <p className={onlineUsers.includes(selectedUser._id) ? "online" : "offline"}>
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
