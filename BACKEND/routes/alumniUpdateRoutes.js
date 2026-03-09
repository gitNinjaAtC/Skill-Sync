import express from "express";
import {
  searchStudents,
  upsertAlumniUpdate,
  getAllAlumniUpdates,
  getVisibleAlumniUpdates,
  deleteAlumniUpdate,
} from "../controllers/alumniUpdateController.js";
import { validateToken } from "../middleware/validateTokenHandler.js";

const router = express.Router();

// Public route for frontend landing page
router.get("/alumni-updates", getVisibleAlumniUpdates);

// Admin searching for students
router.get("/admin/students/search", validateToken, searchStudents);

// Admin management of updates
router.post("/admin/alumni-updates", validateToken, upsertAlumniUpdate);
router.get("/admin/alumni-updates", validateToken, getAllAlumniUpdates);
router.delete("/admin/alumni-updates/:id", validateToken, deleteAlumniUpdate);

export default router;
