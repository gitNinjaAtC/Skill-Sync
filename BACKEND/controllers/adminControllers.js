import User from "../models/Users.js";
import mongoose from "mongoose";

// Admin approval route
export const approveUser = async (req, res) => {
  console.log("Approve user route hit, body:", req.body);
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admins can approve users" });
    }

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isActive) {
      return res.status(400).json({ error: "User is already approved" });
    }

    user.isActive = true;
    await user.save();

    const updatedUser = await User.findById(userId).lean();
    console.log("✅ User approved:", updatedUser);
    return res
      .status(200)
      .json({ message: "User approved successfully", user: updatedUser });
  } catch (err) {
    console.error("❌ Approval error:", err);
    if (err.code === "ECONNRESET") {
      return res.status(500).json({
        error:
          "Database connection error: Connection reset. Please try again later.",
      });
    }
    return res.status(500).json({ error: err.message });
  }
};

//get all users
export const getUsers = async (req, res) => {
  try {
    const { active, role } = req.query;
    const filter = {};

    if (active === "true") filter.isActive = true;
    else if (active === "false") filter.isActive = false;

    if (role) filter.role = role;

    const users = await User.find(filter).select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
};
