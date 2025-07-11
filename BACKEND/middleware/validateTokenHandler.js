import jwt from "jsonwebtoken";
import User from "../models/Users.js";
import dotenv from "dotenv";

dotenv.config();

// ✅ Middleware: Validate JWT Token
export const validateToken = async (req, res, next) => {
  try {
    console.log("🛑 Running validateToken middleware...");
    console.log("Request cookies:", req.cookies);
    console.log("Request headers:", req.headers);

    // Get token from cookies or Authorization header
    const cookieToken = req.cookies?.accessToken;
    const headerToken = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null;

    const token = cookieToken || headerToken;

    if (!token) {
      console.log("❌ No token found in cookies or Authorization header.");
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      clockTolerance: 300, // Allow clock skew
    });

    if (!decoded?.id) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("❌ validateToken error:", error.message);
    return res.status(403).json({ message: "Forbidden: Invalid or expired token" });
  }
};

// ✅ Middleware: Admin-only access check
export const isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }
  next();
};
