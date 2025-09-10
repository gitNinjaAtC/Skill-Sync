import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import User from "../models/Users.js";
import Student from "../models/Student.js";
import {
  getUsers,
  approveUser,
  importFile,
  createAdmin,
  getAllAlumniForms,
} from "../controllers/adminControllers.js";
import { validateToken } from "../middleware/validateTokenHandler.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const router = express.Router();

router.post("/approve-user", validateToken, approveUser);
router.get("/users", getUsers);
router.post("/create", validateToken, createAdmin);

// Nodemailer transporter (make sure env vars are set)
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), "Uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    console.log("File details:", {
      originalname: file.originalname,
      mimetype: file.mimetype,
      ext: path.extname(file.originalname).toLowerCase(),
    }); // Debug log
    const filetypes = /csv|xlsx|xls/;
    const mimetypes = [
      "text/csv",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
    ];
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = mimetypes.includes(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("File type not supported! Only CSV and Excel files allowed."));
  },
});

// Import file endpoint
router.post("/upload", upload.single("file"), importFile);

  // ✅ LOGIN for admin
  router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
      const admin = await User.findOne({ email, role: "admin" });
      if (!admin) {
        return res.status(401).json({ message: "Admin not found or unauthorized" });
      }

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: admin._id, isAdmin: true },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.status(200).json({ token, admin });
    } catch (err) {
      console.error("Admin login error:", err);
      res.status(500).json({ message: "Server error during login" });
    }
  });

  // // ✅ GET user stats
  // router.get("/stats", async (req, res) => {
  //   try {
  //     const total = await User.countDocuments();
  //     const students = await User.countDocuments({ role: "student" });
  //     const alumni = await User.countDocuments({ role: "alumni" });
  //     const admins = await User.countDocuments({ role: "admin" });

  //     res.status(200).json({ total, students, alumni, admins });
  //   } catch (err) {
  //     console.error("Stats error:", err);
  //     res.status(500).json({ message: "Error getting stats" });
  //   }
  // });

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
      // await transporter.sendMail({
      //   from: process.env.EMAIL_USER,
      //   to: user.email,
      //   subject: "SISTec Alumni Portal – Account Approved",
      //   text: `Hi ${user.name},\n\nYour account has been approved. You can now login to the portal.\n\nRegards,\nSISTec Admin`,
      // });

      res.status(200).json({ message: "User approved and notified", user });
    } catch (err) {
      console.error("Approval error:", err);
      res.status(500).json({ message: "Approval failed" });
    }
  });

  // ✅ Get all students in a batch and branch
//   router.get("/students", async (req, res) => {
//   try {
//     const admin = await User.findOne({ email, role: "admin" });
//     if (!admin) {
//       return res
//         .status(401)
//         .json({ message: "Admin not found or unauthorized" });
//     }

//     const isMatch = await bcrypt.compare(password, admin.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     const token = jwt.sign(
//       { id: admin._id, isAdmin: true },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     res.status(200).json({ token, admin });
//   } catch (err) {
//     console.error("Admin login error:", err);
//     res.status(500).json({ message: "Server error during login" });
//   }
// });

// ✅ GET user stats (fix: add faculty count & remove duplicate)
router.get("/stats", async (req, res) => {
  try {
    const total = await User.countDocuments();
    const students = await User.countDocuments({ role: "student" });
    const alumni = await User.countDocuments({ role: "alumni" });
    const admins = await User.countDocuments({ role: "admin" });
    const faculty = await User.countDocuments({ role: "faculty" }); // 👈 added

    res.status(200).json({ total, students, alumni, admins, faculty });
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


// ✅ Get all students in a batch and branch
router.get("/students", async (req, res) => {
  try {
    const { batch, branch } = req.query;

    if (!batch || !branch) {
      return res.status(400).json({ error: "Batch and Branch are required" });
    }

    const students = await Student.find({ batch, branch }).lean();

    // Always return 200 with an array (even if empty)
    return res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Error fetching students" });
  }
});

// ✅ New route to fetch all alumni forms (admin only)
router.get("/alumni-forms", validateToken, getAllAlumniForms);

export default router;
