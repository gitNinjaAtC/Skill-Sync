import express from "express";
import { createJob, approveJob, getJobs } from "../controllers/job.js";
import validateToken from "../middleware/validateTokenHandler.js";

const router = express.Router();

router.post("/", validateToken, createJob);
router.post("/approve/:jobId", validateToken, approveJob);
router.get("/", getJobs);

export default router;
