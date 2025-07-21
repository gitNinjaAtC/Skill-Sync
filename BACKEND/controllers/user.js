// C:\Users\Dell\Desktop\Skill-Sync\BACKEND\controllers\user.js

import User from "../models/Users.js";
import Student from "../models/Student.js";

export const getUser = (req, res) => {
  res.send("API_B: User route");
};

export const getAllUsers = async (req, res) => {
  try {
    // Fetch all users excluding admins
    const users = await User.find(
      { role: { $ne: "admin" } },
      "_id name email role about skills education experience facebook instagram twitter linkedin profilePic"
    );

    // Fetch student records
    const students = await Student.find({}, "EmailId branch batch");

    // Merge users with corresponding student records using email (case-insensitive)
    const enrichedUsers = users.map(user => {
      const student = students.find(std =>
        std.EmailId?.toLowerCase() === user.email?.toLowerCase()
      );
      return {
        ...user._doc,
        branch: student?.branch || "N/A",
        batch: student?.batch || "N/A",
      };
    });

    res.status(200).json(enrichedUsers);
  } catch (error) {
    console.error("❌ Failed to fetch users from DB:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
