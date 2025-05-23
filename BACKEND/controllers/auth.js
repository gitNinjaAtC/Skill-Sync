import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/Users.js";
// Adjust path if needed

// REGISTER
export const register = async (req, res) => {
  try {
    const { username, email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(409).json("User already exists");

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      name,
    });

    await newUser.save();
    console.log("✅ User created successfully!");
    return res.status(200).json("User created");
  } catch (err) {
    console.error("❌ Registration error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json("User not found");

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword)
      return res.status(400).json("Wrong password or username");

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 60 * 60 * 1000,
      path: "/",
    });

    const { password: pwd, ...userData } = user._doc;
    return res.status(200).json(userData);
  } catch (err) {
    console.error("❌ Login error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// VERIFY TOKEN
export const verifyToken = async (req, res) => {
  const token = req.cookies.accessToken;

  if (!token) return res.status(401).json({ error: "Not authenticated" });

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      console.error("JWT verification failed:", err);
      return res.status(403).json({ error: "Invalid token" });
    }

    try {
      const user = await User.findById(decoded.id).select("-password");
      if (!user) return res.status(404).json({ error: "User not found" });

      return res.status(200).json({ user });
    } catch (dbErr) {
      console.error("❌ Error fetching user:", dbErr);
      return res.status(500).json({ error: "Database error" });
    }
  });
};

// LOGOUT
export const logout = (req, res) => {
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res.status(200).json({ message: "Successfully logged out." });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Logout failed", error: err.message });
  }
};
