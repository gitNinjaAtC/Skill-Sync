import jwt from "jsonwebtoken";

export const validateToken = (req, res, next) => {
  console.log("🛑 Running validateToken middleware...");
  console.log("Request cookies:", req.cookies);
  console.log("Request headers:", req.headers);

  // Extract token from cookie (cookie-based auth only)
  const token = req.cookies?.accessToken;

  // Check if token exists
  if (!token) {
    console.log("❌ No accessToken cookie found. Rejecting request.");
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  console.log("✅ Token found:", token.substring(0, 10) + "...");

  // Verify Token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      clockTolerance: 300, // Allow 5-minute clock skew
    });
    console.log("✅ Token valid. User authenticated:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ Token verification error:", {
      name: err.name,
      message: err.message,
      token: token.substring(0, 10) + "...",
    });
    return res
      .status(403)
      .json({ message: "Forbidden: Invalid or expired token" });
  }
};

export const admin = (req, res, next) => {
  // Check if user exists and has admin privileges
  if (req.user && req.user.isAdmin) {
    next(); // User is admin, proceed to the next middleware/controller
  } else {
    res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }
};
