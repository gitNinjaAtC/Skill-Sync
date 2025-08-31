import { create } from "zustand";
import toast from "react-hot-toast";
import { makeRequest } from "../../../axios";
import { useAuthStore } from "../../../store/useAuthStore";

/**
 * localStorage keys we use:
 *  - lastReadAtByUser: { [userId]: ISOString }
 *  - chatUsers: cached users with unreadCount (best-effort cache)
 */

const readLastReadMap = () =>
  JSON.parse(localStorage.getItem("lastReadAtByUser") || "{}");
const writeLastReadMap = (map) =>
  localStorage.setItem("lastReadAtByUser", JSON.stringify(map));

const touchLastRead = (userId, whenISO = new Date().toISOString()) => {
  const map = readLastReadMap();
  map[userId] = whenISO;
  writeLastReadMap(map);
};

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  // Fetch chat users and compute unread counts based on lastReadAtByUser
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await makeRequest.get("/API_B/messages/users");
      const { authUser } = useAuthStore.getState();
      const lastReadMap = readLastReadMap();

      // Start with a simple shape; we'll compute counts below
      let baseUsers = (res.data || []).map((u) => ({
        ...u,
        unreadCount: 0,
        lastMessageAt: u.lastMessageAt || null,
      }));

      // Compute unread counts by fetching each thread and counting
      // messages sent BY that user AFTER our lastReadAt timestamp.
      const counted = await Promise.all(
        baseUsers.map(async (u) => {
          try {
            // Skip counting for currently open chat (will be 0)
            if (get().selectedUser?._id === u._id) {
              return { ...u, unreadCount: 0 };
            }

            const lastReadAt = lastReadMap[u._id]
              ? new Date(lastReadMap[u._id]).getTime()
              : 0;

            // Pull the thread and count new incoming messages
            const threadRes = await makeRequest.get(
              `/API_B/messages/${u._id}?senderId=${authUser._id}`
            );
            const msgs = threadRes.data || [];

            let newCount = 0;
            for (const m of msgs) {
              const created = new Date(m.createdAt).getTime();
              const senderId =
                m.senderId || m.sender?._id || m.sender?._id?.toString();
              if (created > lastReadAt && senderId === u._id) {
                newCount++;
              }
            }

            return { ...u, unreadCount: newCount };
          } catch (e) {
            console.error("count unread for user failed:", u._id, e);
            // Fail-safe: leave 0 (don't explode UI)
            return u;
          }
        })
      );

      // Save + set
      localStorage.setItem("chatUsers", JSON.stringify(counted));
      set({ users: counted });
    } catch (error) {
      console.error("getUsers error:", error);
      toast.error(error?.response?.data?.message || "Failed to fetch users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // Fetch messages with a specific user and mark read
  getMessages: async (userId) => {
    const { authUser } = useAuthStore.getState();
    set({ isMessagesLoading: true });

    try {
      const res = await makeRequest.get(
        `/API_B/messages/${userId}?senderId=${authUser._id}`
      );

      set({ messages: res.data });

      // Mark this chat as read "now"
      touchLastRead(userId);

      // Reset unread count for this user in state + cache
      set((state) => {
        const updatedUsers = state.users.map((u) =>
          u._id === userId ? { ...u, unreadCount: 0 } : u
        );
        localStorage.setItem("chatUsers", JSON.stringify(updatedUsers));
        return { users: updatedUsers };
      });
    } catch (error) {
      console.error("getMessages error:", error);
      toast.error(error?.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // Send a message and append to current thread
  sendMessage: async (messageData) => {
    const { selectedUser } = get();
    try {
      const res = await makeRequest.post(
        `/API_B/messages/send/${selectedUser._id}`,
        messageData
      );

      // Since you are in the chat, keep it read (touch lastRead to now)
      touchLastRead(selectedUser._id, res.data.createdAt);

      set((state) => {
        const updatedUsers = state.users.map((u) =>
          u._id === selectedUser._id
            ? { ...u, lastMessageAt: res.data.createdAt }
            : u
        );
        localStorage.setItem("chatUsers", JSON.stringify(updatedUsers));
        return {
          messages: [...state.messages, res.data],
          users: updatedUsers,
        };
      });
    } catch (error) {
      console.error("sendMessage error:", error);
      toast.error(error?.response?.data?.message || "Failed to send message");
    }
  },

  // Real-time new message listener
  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      const { selectedUser } = get();
      const msgFromId =
        newMessage.senderId ||
        newMessage.sender?._id ||
        newMessage.sender?._id?.toString();

      set((state) => {
        const isActiveChat = selectedUser && selectedUser._id === msgFromId;

        // If this chat is open, mark as read up to this message
        if (isActiveChat) {
          touchLastRead(msgFromId, newMessage.createdAt);
        }

        const updatedUsers = state.users.map((u) =>
          u._id === msgFromId
            ? {
                ...u,
                lastMessageAt: newMessage.createdAt,
                unreadCount: isActiveChat ? 0 : (u.unreadCount || 0) + 1,
              }
            : u
        );

        localStorage.setItem("chatUsers", JSON.stringify(updatedUsers));

        return {
          messages:
            isActiveChat ? [...state.messages, newMessage] : state.messages,
          users: updatedUsers,
        };
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("newMessage");
  },

  // Select user & clear its unread count + mark lastRead
  setSelectedUser: (selectedUser) =>
    set((state) => {
      if (!selectedUser) {
        return { selectedUser: null };
      }

      // Mark as read "now" when opening the chat
      touchLastRead(selectedUser._id);

      const updatedUsers = state.users.map((u) =>
        u._id === selectedUser._id ? { ...u, unreadCount: 0 } : u
      );

      localStorage.setItem("chatUsers", JSON.stringify(updatedUsers));
      return { selectedUser, users: updatedUsers };
    }),

  // Manually reset unread for one user & update lastRead timestamp
  resetUnreadCount: (userId) =>
    set((state) => {
      touchLastRead(userId);
      const updatedUsers = state.users.map((u) =>
        u._id === userId ? { ...u, unreadCount: 0 } : u
      );
      localStorage.setItem("chatUsers", JSON.stringify(updatedUsers));
      return { users: updatedUsers };
    }),

  // Reset whole chat state (use on logout)
  resetChat: () =>
    set({
      messages: [],
      users: [],
      selectedUser: null,
      isUsersLoading: false,
      isMessagesLoading: false,
    }),
}));
