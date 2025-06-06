import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import db from "./connect.js";
import path from "path";

// Routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import profileRoutes from "./routes/profile.js";
import postRoutes from "./routes/posts.js";
import commentRoutes from "./routes/comments.js";
import likeRoutes from "./routes/likes.js";
import forumRoutes from "./routes/forums.js";
import jobRoutes from "./routes/job.js";

dotenv.config();

const app = express();

db();

const allowedOrigins = [
  "http://localhost:3000",
  "https://skill-sync-frontend.onrender.com",
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Use CORS for all routes
app.use(cors(corsOptions));

// Handle preflight OPTIONS requests for all routes
app.options("*", cors(corsOptions));

// Middleware
app.use(express.json());
app.use(cookieParser());

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
app.use("/API_B/jobs", jobRoutes);
app.use("/API_B/profile", profileRoutes);

const PORT = process.env.PORT || 8800;
app.listen(PORT, () => {
  console.log(`API_B is running on http://localhost:${PORT}`);
});
