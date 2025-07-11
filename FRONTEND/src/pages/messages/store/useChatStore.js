import { create } from "zustand";
import toast from "react-hot-toast";
import { makeRequest } from "../../../axios";
import { useAuthStore } from "../../../store/useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  // ✅ Fetch chat users
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await makeRequest.get("/API_B/messages/users");
      set({ users: res.data });
    } catch (error) {
      console.error("getUsers error:", error);
      toast.error(error?.response?.data?.message || "Failed to fetch users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // ✅ Fetch messages between current user and selected user
  getMessages: async (userId) => {
    const { authUser } = useAuthStore.getState(); // 👈 fetch senderId
    set({ isMessagesLoading: true });

    try {
      const res = await makeRequest.get(`/API_B/messages/${userId}?senderId=${authUser._id}`);
      set({ messages: res.data });
    } catch (error) {
      console.error("getMessages error:", error);
      toast.error(error?.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // ✅ Send message and append it
  sendMessage: async (messageData) => {
    const { selectedUser } = get();
    try {
      const res = await makeRequest.post(
        `/API_B/messages/send/${selectedUser._id}`,
        messageData
      );
      set((state) => ({
        messages: [...state.messages, res.data], // ✅ safely append to existing messages
      }));
    } catch (error) {
      console.error("sendMessage error:", error);
      toast.error(error?.response?.data?.message || "Failed to send message");
    }
  },

  // ✅ Real-time listener for new incoming messages
  subscribeToMessages: () => {
    const { selectedUser } = get();
    const socket = useAuthStore.getState().socket;
    if (!selectedUser || !socket) return;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set((state) => ({
        messages: [...state.messages, newMessage],
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
