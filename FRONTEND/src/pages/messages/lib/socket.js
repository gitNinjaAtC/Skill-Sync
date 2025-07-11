// socket.js
import { io } from "socket.io-client";
import { useAuthStore } from "../../../store/useAuthStore";

let socket;

export const initSocket = () => {
  const { authUser, setOnlineUsers } = useAuthStore.getState();

  if (!authUser?._id) return;

  if (!socket) {
    socket = io("http://localhost:8800", {
      query: {
        userId: authUser._id,
      },
      withCredentials: true,
    });

    // 🔁 Listen to online users list
    socket.on("getOnlineUsers", (onlineUserIds) => {
      console.log("📡 Online Users:", onlineUserIds);
      setOnlineUsers(onlineUserIds);
    });
  }
};

export const getSocket = () => socket;
