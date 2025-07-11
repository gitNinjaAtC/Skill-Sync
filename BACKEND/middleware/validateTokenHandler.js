import jwt from "jsonwebtoken";
import User from "../models/Users.js"; // Use your primary user model
import dotenv from "dotenv";

dotenv.config();

const  validateToken = async (req, res, next) => {
    try {
    const token = req.cookies?.accessToken; // ✅ Standardized token key

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // ✅ Decode & verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      clockTolerance: 300, // Allow small clock skew
    });

    if (!decoded?.id) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    // ✅ Optional: fetch full user from DB
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Attach user to request object
    req.user = user;

    next();
  } catch (error) {
    console.error("❌ protectRoute error:", error.message);
    return res.status(403).json({ message: "Forbidden: Invalid or expired token" });
  }
};

// ✅ Optional: Admin-only access
const isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }
  next();
};

export { validateToken, isAdmin };
