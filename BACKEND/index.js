// index.js
import express from "express";
import http from "http";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import db from "./connect.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { initSocketServer } from "./lib/socket.js";

// Routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import profileRoutes from "./routes/profile.js";
import postRoutes from "./routes/posts.js";
import commentRoutes from "./routes/comments.js";
import likeRoutes from "./routes/likes.js";
import forumRoutes from "./routes/forums.js";
import jobRoutes from "./routes/job.js";
import adminRoutes from "./routes/adminRoutes.js";
import messageRoutes from "./routes/message.route.js";

dotenv.config();
db();

const app = express();
const server = http.createServer(app); // attach socket.io to this server

// CORS setup
const allowedOrigins = [
  "http://localhost:3000", // Frontend
  "http://localhost:3001", // ✅ ADDED for Admin panel on port 3001
  "https://skill-sync-frontend.onrender.com",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // handle preflight
app.use(express.json());
app.use(cookieParser());

// Serve static uploaded files
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Debug Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("Incoming cookies:", req.cookies);
  next();
});

// API Routes
app.use("/API_B/auth", authRoutes);
app.use("/API_B/users", userRoutes);
app.use("/API_B/posts", postRoutes);
app.use("/API_B/comments", commentRoutes);
app.use("/API_B/likes", likeRoutes);
app.use("/API_B/forums", forumRoutes);
app.use("/API_B/jobs", jobRoutes);
app.use("/API_B/profile", profileRoutes);
app.use("/API_B/admin", adminRoutes);
app.use("/API_B/messages", messageRoutes);

// Start Socket.IO
initSocketServer(server);

// Run server
const PORT = process.env.PORT || 8800;
server.listen(PORT, () => {
  console.log(`🚀 API_B + Socket.IO running at http://localhost:${PORT}`);
});
