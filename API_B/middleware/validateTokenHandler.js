import jwt from "jsonwebtoken";

const validateToken = (req, res, next) => {
  console.log("🛑 Running validateToken middleware...");

  // ✅ Extract token from Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("❌ No Bearer token found. Rejecting request.");
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  // ✅ Get the token (remove "Bearer ")
  const token = authHeader.split(" ")[1];

  // ✅ Verify Token
  jwt.verify(token, process.env.JWT_SECRET, (err, userData) => {
    if (err) {
      console.log("❌ Invalid token:", err.message);
      return res
        .status(403)
        .json({ message: "Forbidden: Invalid or expired token" });
    }

    console.log("✅ Token valid. User authenticated:", userData);
    req.user = userData; // Store user data for further use
    next();
  });
};

export default validateToken;
