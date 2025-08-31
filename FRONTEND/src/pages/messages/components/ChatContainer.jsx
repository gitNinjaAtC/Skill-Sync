import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../../../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { groupMessagesByDate } from "../lib/dateGrouping";
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
    users,
    resetUnreadCount,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const newMarkerRef = useRef(null); // Divider ref
  const [selectedImage, setSelectedImage] = useState(null);

  // Current user's unread info
  const currentUserMeta = users.find((u) => u._id === selectedUser?._id);
  const unreadCount = currentUserMeta?.unreadCount || 0;

  // Determine index of first unread message
  const splitIndex = (() => {
    if (!selectedUser?._id || unreadCount <= 0) return null;

    let count = 0;
    for (let i = 0; i < messages.length; i++) {
      if (messages[i].senderId !== authUser._id) count++;
      if (count === unreadCount) return i;
    }
    return null;
  })();

  // Load chat and subscribe to new messages
  useEffect(() => {
    if (!selectedUser?._id) return;
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser?._id]);

  // Auto-scroll logic
  useEffect(() => {
    if (!selectedUser?._id) return;

    if (unreadCount > 0 && newMarkerRef.current) {
      newMarkerRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => resetUnreadCount(selectedUser._id), 0);
    } else if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, unreadCount, selectedUser?._id, resetUnreadCount]);

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

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="chat-container relative">
      <ChatHeader />

      <div className="chat-body scrollable">
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            <div className="chat-date-heading">{date}</div>
            {msgs.map((message, idx) => {
              const isNewMessageStart =
                splitIndex !== null && messages.findIndex((m) => m._id === message._id) === splitIndex;

              return (
                <div key={message._id}>
                  {isNewMessageStart && (
                    <div ref={newMarkerRef} className="new-messages-divider">
                      <span>New Messages</span>
                    </div>
                  )}

                  <div
                    className={`chat-message ${
                      message.senderId === authUser._id ? "chat-end" : "chat-start"
                    }`}
                    ref={idx === messages.length - 1 ? messageEndRef : null}
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
                </div>
              );
            })}
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
