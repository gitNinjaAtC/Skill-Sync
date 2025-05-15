import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

// Routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import profileRoutes from "./routes/profile.js";
import postRoutes from "./routes/posts.js";
import commentRoutes from "./routes/comments.js";
import likeRoutes from "./routes/likes.js";
import forumRoutes from "./routes/forums.js";
<<<<<<< HEAD
import jobRoutes from "./routes/job.js";

import dotenv from "dotenv";
dotenv.config();
=======
>>>>>>> 50e576e5 (update profile page)

// Initialize environment
dotenv.config();
const app = express();

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight
app.options("*", cors());

// Middleware
app.use(express.json());
app.use(cookieParser());

// ✅ Serve uploaded files (cover photos, etc.)
app.use("/uploads", express.static("uploads"));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("Incoming cookies:", req.cookies);
  console.log("Request headers:", req.headers);
  next();
});

// Routes
app.use("/API_B/auth", authRoutes);
app.use("/API_B/users", userRoutes);
app.use("/API_B/posts", postRoutes);
app.use("/API_B/comments", commentRoutes);
app.use("/API_B/likes", likeRoutes);
app.use("/API_B/forums", forumRoutes);
<<<<<<< HEAD
app.use("/API_B/jobs", jobRoutes);
=======
app.use("/API_B/profile", profileRoutes);
>>>>>>> 50e576e5 (update profile page)

// Start server
const PORT = process.env.PORT || 8800;
app.listen(PORT, () => {
  console.log(`API_B is running on http://localhost:${PORT}`);
});
