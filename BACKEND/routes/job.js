import express from "express";
import {
  createJob,
  approveJob,
  rejectJob,
  getJobs,
  getJobById,
  getMyJobs,
  getPendingJobs,
  getJobStats,
  getAdminJobs,
} from "../controllers/job.js";
import {
  applyToJob,
  checkApplicationStatus,
  getMyApplications,
  updateApplicationStatus,
  getApplicationsForJob,
  getApplicantsForMyJobs,
} from "../controllers/jobApplicationController.js";
import { validateToken } from "../middleware/validateTokenHandler.js";

const router = express.Router();

// Create a job (Alumni only)
router.post("/", validateToken, createJob);

// Approve a job (Admin only)
router.post("/approve/:jobId", validateToken, approveJob);

// Reject a job (Admin only)
router.post("/reject/:jobId", validateToken, rejectJob);

// Get my posted jobs (Alumni/Faculty)
router.get("/my/jobs", validateToken, getMyJobs);

// Get my job applications (Student)
router.get("/my/applications", validateToken, getMyApplications);

// Get applicants for my jobs (Alumni/Faculty)
router.get("/my/applicants", validateToken, getApplicantsForMyJobs);

// Get pending jobs (Admin only)
router.get("/admin/pending", validateToken, getPendingJobs);

// Get job stats (Admin only)
router.get("/admin/stats", validateToken, getJobStats);

// Get all jobs with status filter (Admin only)
router.get("/admin/all", validateToken, getAdminJobs);

// Get all approved jobs
router.get("/", getJobs);

// ✅ NEW: Get a specific job by ID
router.get("/:id", validateToken, getJobById);

// Job Applications
router.get("/:jobId/applications", validateToken, getApplicationsForJob);
router.post("/:jobId/apply", validateToken, applyToJob);
router.get("/:jobId/my-status", validateToken, checkApplicationStatus);

router.put("/application/:applicationId/status", validateToken, updateApplicationStatus);

export default router;
