import express from "express";
import {
  createJob,
  approveJob,
  getJobs,
  getJobById, // new controller
} from "../controllers/job.js";
import validateToken from "../middleware/validateTokenHandler.js";

const router = express.Router();

// Create a job (Alumni only)
router.post("/", validateToken, createJob);

// Approve a job (Admin only)
router.post("/approve/:jobId", validateToken, approveJob);

// Get all approved jobs
router.get("/", getJobs);

// ✅ NEW: Get a specific job by ID (for JobDescription.jsx)
router.get("/:id", getJobById);

export default router;
