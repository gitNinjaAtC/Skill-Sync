import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import commentRoutes from "./routes/comments.js";
import likeRoutes from "./routes/likes.js";
import forumRoutes from "./routes/forums.js";
import jobRoutes from "./routes/job.js";

import dotenv from "dotenv";
dotenv.config();

const app = express();

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:3000", // Frontend URL
    credentials: true, // Allow cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allow necessary methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allow necessary headers
  })
);

// Handle preflight OPTIONS requests
app.options("*", cors());

// ✅ Middleware for JSON & Cookies
app.use(express.json());
app.use(cookieParser());

// ✅ Log access to API routes (Place this **above** route handlers)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("Incoming cookies:", req.cookies);
  console.log("Request headers:", req.headers);
  next();
});
// ✅ Routes
app.use("/API_B/auth", authRoutes);
app.use("/API_B/users", userRoutes);
app.use("/API_B/posts", postRoutes);
app.use("/API_B/comments", commentRoutes);
app.use("/API_B/likes", likeRoutes);
app.use("/API_B/forums", forumRoutes);
app.use("/API_B/jobs", jobRoutes);

// ✅ Start Server
app.listen(8800, () => {
  console.log("API_B is running on http://localhost:8800");
});
