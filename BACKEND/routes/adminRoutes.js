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
  deleteBranch,
  getEnrichedStudents,
} from "../controllers/adminControllers.js";
import { validateToken } from "../middleware/validateTokenHandler.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const router = express.Router();

router.post("/approve-user", validateToken, approveUser);
router.get("/users", getUsers);
router.post("/create", validateToken, createAdmin);
router.post("/delete-branch", deleteBranch);

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
    const filetypes = /csv|xlsx|xls/;
    const mimetypes = [
      "text/csv",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = mimetypes.includes(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error("File type not supported! Only CSV and Excel files allowed."));
  },
});

router.post("/upload", upload.single("file"), importFile);

// ✅ Admin login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await User.findOne({ email, role: "admin" });
    if (!admin)
      return res.status(401).json({ message: "Admin not found or unauthorized" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

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

// ✅ GET registered user stats (Users collection — used by Dashboard)
router.get("/stats", async (req, res) => {
  try {
    const total = await User.countDocuments();
    const students = await User.countDocuments({ role: "student" });
    const alumni = await User.countDocuments({ role: "alumni" });
    const admins = await User.countDocuments({ role: "admin" });
    const faculty = await User.countDocuments({ role: "faculty" });
    res.status(200).json({ total, students, alumni, admins, faculty });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ message: "Error getting stats" });
  }
});

// ✅ GET comprehensive student stats
// Optional query params: ?batch=YYYY-YYYY  ?branch=CSE
// Response shape:
//   grandTotal          – total Student docs matching filter
//   batches[]           – distinct batches in result
//   branches[]          – distinct branches in result
//   matrix              – { [batch]: { [branch]: count } }
//   batchTotals         – { [batch]: count }
//   branchTotals        – { [branch]: count }
//   registeredTotal     – how many of those students have a User account
//   registeredByBranch  – { [branch]: registeredCount }
//   userRoleStats       – { total, student, alumni, faculty, admin } from Users collection
router.get("/student-stats", async (req, res) => {
  try {
    const { batch: batchFilter, branch: branchFilter } = req.query;

    const matchStage = {};
    if (batchFilter) matchStage.batch = batchFilter;
    if (branchFilter) matchStage.branch = branchFilter;

    // 1. Aggregate student counts + collect emails per batch×branch cell
    const grouped = await Student.aggregate([
      ...(Object.keys(matchStage).length ? [{ $match: matchStage }] : []),
      {
        $group: {
          _id: { batch: "$batch", branch: "$branch" },
          count: { $sum: 1 },
          emails: { $push: "$EmailId" },
        },
      },
      { $sort: { "_id.batch": 1, "_id.branch": 1 } },
    ]);

    const batchSet = new Set();
    const branchSet = new Set();
    const matrix = {};
    const emailsByBranch = {}; // branch -> Set of normalised emails

    grouped.forEach(({ _id, count, emails }) => {
      const batch = _id.batch || "Unknown";
      const branch = _id.branch || "Unknown";
      batchSet.add(batch);
      branchSet.add(branch);
      if (!matrix[batch]) matrix[batch] = {};
      matrix[batch][branch] = count;

      if (!emailsByBranch[branch]) emailsByBranch[branch] = new Set();
      emails.forEach((e) => {
        if (e) emailsByBranch[branch].add(e.toLowerCase().trim());
      });
    });

    const batches = [...batchSet].sort();
    const branches = [...branchSet].sort();

    const batchTotals = {};
    batches.forEach((b) => {
      batchTotals[b] = Object.values(matrix[b] || {}).reduce((s, c) => s + c, 0);
    });

    const branchTotals = {};
    branches.forEach((br) => {
      branchTotals[br] = batches.reduce((s, b) => s + (matrix[b]?.[br] || 0), 0);
    });

    const grandTotal = Object.values(batchTotals).reduce((s, c) => s + c, 0);

    // 2. Registered user counts — join Student emails → Users collection
    const allEmails = branches.flatMap((br) => [...(emailsByBranch[br] || [])]);

    const registeredTotal = await User.countDocuments({
      email: { $in: allEmails },
    });

    const registeredByBranch = {};
    await Promise.all(
      branches.map(async (br) => {
        const emails = [...(emailsByBranch[br] || [])];
        registeredByBranch[br] = await User.countDocuments({
          email: { $in: emails },
        });
      })
    );

    // 3. Overall platform user role breakdown (unfiltered — for the top cards)
    const userRoleStats = {
      total: await User.countDocuments(),
      student: await User.countDocuments({ role: "student" }),
      alumni: await User.countDocuments({ role: "alumni" }),
      faculty: await User.countDocuments({ role: "faculty" }),
      admin: await User.countDocuments({ role: "admin" }),
    };

    res.status(200).json({
      grandTotal,
      batches,
      branches,
      matrix,
      batchTotals,
      branchTotals,
      registeredTotal,
      registeredByBranch,
      userRoleStats,
    });
  } catch (err) {
    console.error("Student stats error:", err);
    res.status(500).json({ message: "Error getting student stats" });
  }
});

// ✅ Change user role
router.put("/user/:id/role", async (req, res) => {
  const { role } = req.body;
  if (!role) return res.status(400).json({ message: "Role is required." });
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found." });
    res.status(200).json({ message: "Role updated", user });
  } catch (err) {
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
    res.status(500).json({ message: "Failed to delete user" });
  }
});

// ✅ Get students by batch + branch
router.get("/students", async (req, res) => {
  try {
    const { batch, branch } = req.query;
    if (!batch || !branch)
      return res.status(400).json({ error: "Batch and Branch are required" });
    const students = await Student.find({ batch, branch }).lean();
    return res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error: "Error fetching students" });
  }
});

router.get("/alumni-forms", validateToken, getAllAlumniForms);
router.get("/students/enriched", getEnrichedStudents);

export default router;