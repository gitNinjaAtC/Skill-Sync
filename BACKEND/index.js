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
import rateLimit from "express-rate-limit"; // ✅ added

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
import alumniFormRoutes from "./routes/alumniFormRoutes.js";
import alumniUpdateRoutes from "./routes/alumniUpdateRoutes.js";
import collaborateRoutes from "./routes/collaborateRoutes.js";


dotenv.config();
db();

const app = express();
const server = http.createServer(app);

// ✅ Login rate limiter (5 attempts per 5 minutes)
const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Allow up to 10 attempts per 5 minutes
  message: "⚠️ Too many login attempts. Please wait 5 minutes before trying again.",
  standardHeaders: true, // Sends `RateLimit-*` headers
  legacyHeaders: false,  // Disables `X-RateLimit-*` headers
});

// CORS setup
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://skill-sync-admin.onrender.com",
  "https://skill-sync-frontend.onrender.com",
  "https://alumni.sistec.ac.in",
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
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
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

// ✅ Health check
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// ✅ Apply rate limit to login route only
app.use("/API_B/auth/login", loginLimiter);
app.use("/API_B/collaborate", collaborateRoutes);

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
app.use("/API_B", alumniFormRoutes); 
app.use("/API_B", alumniUpdateRoutes);


// Start socket server
initSocketServer(server);

const PORT = process.env.PORT || 8800;
server.listen(PORT, () => {
  console.log(`🚀 API_B + Socket.IO running at http://localhost:${PORT}`);
});
