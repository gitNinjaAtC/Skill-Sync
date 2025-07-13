import { create } from "zustand";
import { io } from "socket.io-client";
import axios from "axios";

// ✅ Use same base URL logic as Axios setup
const BASE_URL =
  process.env.NODE_ENV === "development"
    ? process.env.REACT_APP_API_BASE_URL_LOCAL || "http://localhost:8800"
    : process.env.REACT_APP_API_BASE_URL_PROD || "https://skill-sync-backend-522o.onrender.com";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  // ✅ Called on app load or login success
  checkAuth: async () => {
    try {
      const res = await axios.get(`${BASE_URL}/API_B/auth/check`, {
        withCredentials: true,
      });

      set({ authUser: res.data });
      get().connectSocket();
    } catch (err) {
      console.error("❌ Auth check failed:", err.message);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // ✅ Set user after login
  setCurrentUser: (user) => {
    set({ authUser: user });
    get().connectSocket();
  },

  // ✅ Connect Socket.IO properly using BASE_URL
  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser || socket?.connected) return;

    const newSocket = io(BASE_URL, {
      withCredentials: true,
      query: { userId: authUser._id },
      transports: ["websocket"], // ✅ Avoid fallback to polling
    });

    newSocket.connect();

    newSocket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket?.connected) socket.disconnect();
  },
}));
