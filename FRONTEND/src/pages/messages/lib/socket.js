// socket.js
import { io } from "socket.io-client";
import { useAuthStore } from "../../../store/useAuthStore";

// ✅ Use dynamic BASE_URL depending on environment
const BASE_URL =
  process.env.NODE_ENV === "development"
    ? process.env.REACT_APP_API_BASE_URL_LOCAL || "http://localhost:8800"
    : process.env.REACT_APP_API_BASE_URL_PROD || "https://skill-sync-backend-522o.onrender.com";

let socket;

export const initSocket = () => {
  const { authUser, setOnlineUsers } = useAuthStore.getState();

  if (!authUser?._id) return;

  if (!socket) {
    socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
      withCredentials: true,
      transports: ["websocket"], // ✅ Force websocket to avoid polling in production
    });

    socket.on("getOnlineUsers", (onlineUserIds) => {
      console.log("📡 Online Users:", onlineUserIds);
      setOnlineUsers(onlineUserIds);
    });
  }
};

export const getSocket = () => socket;
