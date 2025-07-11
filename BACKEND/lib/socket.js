import { Server } from "socket.io";

let io;
const userSocketMap = {}; // { userId: socketId }

export const initSocketServer = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://skill-sync-frontend.onrender.com",
      ],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (!userId) {
      console.warn("⚠️ Connection attempted without userId.");
      return;
    }

    console.log("✅ User connected:", socket.id, "| UserID:", userId);
    userSocketMap[userId] = socket.id;

    // Emit online users to everyone
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
      if (userSocketMap[userId] === socket.id) {
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
      }
    });
  });
};

export const getReceiverSocketId = (userId) => userSocketMap[userId];
export { io };
