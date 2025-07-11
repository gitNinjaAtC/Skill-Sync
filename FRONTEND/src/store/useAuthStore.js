import { create } from "zustand";
import { io } from "socket.io-client";
import axios from "axios";

const BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8800"
    : window.location.origin;


export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  // Call this on app load or login success
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

  // Call after successful login
  setCurrentUser: (user) => {
    set({ authUser: user });
    get().connectSocket();
  },

  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser || socket?.connected) return;

    const newSocket = io(BASE_URL, {
      withCredentials: true,
      query: { userId: authUser._id },
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
