import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../../../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import avatar from "../../../assets/avatar.png";
import "./chatContainer.scss";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (!selectedUser?._id) return;
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser?._id]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const resolveProfilePic = (user) => {
    if (!user?.profilePic || user.profilePic.trim() === "") return avatar;
    return user.profilePic.startsWith("http")
      ? user.profilePic
      : `https://skill-sync-backend-522o.onrender.com${user.profilePic}`;
  };

  if (isMessagesLoading) {
    return (
      <div className="chat-container">
        <ChatHeader />
        <div className="chat-body">
          <MessageSkeleton />
        </div>
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="chat-container relative">
      <ChatHeader />

      <div className="chat-body scrollable">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat-message ${
              message.senderId === authUser._id ? "chat-end" : "chat-start"
            }`}
            ref={messageEndRef}
          >
            <div className="chat-content">
              <div className="chat-avatar">
                <img
                  src={
                    message.senderId === authUser._id
                      ? resolveProfilePic(authUser)
                      : resolveProfilePic(selectedUser)
                  }
                  alt="profile pic"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = avatar;
                  }}
                />
              </div>

              <div className="chat-bubble-container">
                <div className="chat-header">
                  <time>{formatMessageTime(message.createdAt)}</time>
                </div>

                <div
                  className={`chat-bubble ${
                    message.image && !message.text ? "image-only" : ""
                  }`}
                >
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      onClick={() => setSelectedImage(message.image)}
                      className="chat-image"
                    />
                  )}
                  {message.text && <p>{message.text}</p>}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      <MessageInput />

      {selectedImage && (
        <div className="image-modal" onClick={() => setSelectedImage(null)}>
          <img
            src={selectedImage}
            alt="Full View"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default ChatContainer;
