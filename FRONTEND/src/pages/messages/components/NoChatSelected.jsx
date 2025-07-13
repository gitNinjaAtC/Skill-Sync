import { MessageSquare } from "lucide-react";
import "./noChatSelected.scss";
import { useContext } from "react";
import { AuthContext } from "../../../context/authContext";

const NoChatSelected = () => {
  const { currentUser } = useContext(AuthContext);
  return (
    <div className="no-chat-container">
      <div className="no-chat-content">
        <div className="icon-wrapper">
          <div className="icon-bounce">
            <MessageSquare className="chat-icon" />
          </div>
        </div>

        <h2 className="welcome-title">Welcome, {currentUser.name}!</h2>
        <p className="welcome-subtitle">
          Select a conversation from the sidebar to start chatting
        </p>
      </div>
    </div>
  );
};

export default NoChatSelected;
