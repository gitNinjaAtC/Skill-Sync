import { useEffect, useContext } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../../../store/useAuthStore";
import { AuthContext } from "../../../context/authContext";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import "./home.scss";

const HomePage = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { setCurrentUser } = useAuthStore();
  const { currentUser } = useContext(AuthContext);
  const isChatOpen = Boolean(selectedUser);

  useEffect(() => {
  if (currentUser) {
    setCurrentUser(currentUser); // Pass full user object here
  }
}, [currentUser, setCurrentUser]);


  if (!currentUser) {
    return <div className="home">Please log in to continue.</div>;
  }

  return (
    <div className="home">
      <div className="home-header">
        <h1>Messages</h1>
      </div>
      <div className="home-wrapper">
        <div className="home-content">
          <div className="chat-wrapper">
            {/* Sidebar */}
            <aside className={`chat-sidebar ${isChatOpen ? "mobile-hidden" : ""}`}>
              <Sidebar />
            </aside>

            {/* Chat Area */}
            <main className="chat-main">

              <div className="chat-body">
                {isChatOpen ? <ChatContainer /> : <NoChatSelected />}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
