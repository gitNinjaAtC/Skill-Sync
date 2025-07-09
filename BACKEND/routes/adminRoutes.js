import express from "express";
import User from "../models/Users.js";
import { getUsers, approveUser } from "../controllers/adminControllers.js";
// import nodemailer from "nodemailer";
import { validateToken } from "../middleware/validateTokenHandler.js";

const router = express.Router();

router.post("/approve-user", validateToken, approveUser);
router.get("/users", validateToken, getUsers);

// Nodemailer transporter (make sure env vars are set)
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// ✅ GET all users, with optional filters
// router.get("/users", async (req, res) => {
//   try {
//     const { active, role } = req.query;
//     const filter = {};

//     if (active === "true") filter.isActive = true;
//     else if (active === "false") filter.isActive = false;

//     if (role) filter.role = role;

//     const users = await User.find(filter).select("-password");
//     res.status(200).json(users);
//   } catch (error) {
//     console.error("Error fetching users:", error);
//     res.status(500).json({ message: "Error fetching users" });
//   }
// });

// ✅ GET user stats
router.get("/stats", async (req, res) => {
  try {
    const total = await User.countDocuments();
    const students = await User.countDocuments({ role: "student" });
    const alumni = await User.countDocuments({ role: "alumni" });
    const admins = await User.countDocuments({ role: "admin" });

    res.status(200).json({ total, students, alumni, admins });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ message: "Error getting stats" });
  }
});

// ✅ Change user role
router.put("/user/:id/role", async (req, res) => {
  const { role } = req.body;
  if (!role) return res.status(400).json({ message: "Role is required." });

  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found." });

    res.status(200).json({ message: "Role updated", user });
  } catch (err) {
    console.error("Role update error:", err);
    res.status(500).json({ message: "Failed to update role" });
  }
});

// ✅ Delete user
router.delete("/user/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

// ✅ Approve user (activate + email)
router.put("/approve/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    // Send approval email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "SISTec Alumni Portal – Account Approved",
      text: `Hi ${user.name},\n\nYour account has been approved. You can now login to the portal.\n\nRegards,\nSISTec Admin`,
    });

    res.status(200).json({ message: "User approved and notified", user });
  } catch (err) {
    console.error("Approval error:", err);
    res.status(500).json({ message: "Approval failed" });
  }
});

export default router;
