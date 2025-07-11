// C:\Users\Dell\Desktop\SkillSync\Skill-Sync\BACKEND\controllers\user.js

import User from "../models/Users.js"; // adjust path if needed

// Dummy route (optional)
export const getUser = (req, res) => {
  res.send("API_B: User route");
};

// ✅ Actual route to fetch all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "_id name email role about skills education experience facebook instagram twitter linkedin profilePic");
    res.status(200).json(users);
  } catch (error) {
    console.error("❌ Failed to fetch users from DB:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
