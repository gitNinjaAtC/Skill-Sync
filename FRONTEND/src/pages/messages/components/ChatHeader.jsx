import { X } from "lucide-react";
import { useAuthStore } from "../../../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import avatar from "../../../assets/avatar.png";
import "./chatHeader.scss";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  return (
    <div className="chat-header-container">
      <div className="chat-header-inner">
        <div className="user-info">
          <div className="avatar">
            <div className="avatar-img">
              <img
                src={selectedUser.profilePic || avatar}
                alt={selectedUser.name}
              />
            </div>
          </div>

          <div className="user-meta">
            <h3>{selectedUser.name}</h3>
            <p className={onlineUsers.includes(selectedUser._id) ? "online" : "offline"}>
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <button className="close-btn" onClick={() => setSelectedUser(null)}>
          <X />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
