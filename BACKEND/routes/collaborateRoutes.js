import express from "express";
import { validateToken } from "../middleware/validateTokenHandler.js";
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProjectStatus,
  deleteProject,
  applyToProject,
  getMyApplications,
  getProjectApplications,
  updateApplicationStatus,
  getProjectUpdates,
  postProjectUpdate,
} from "../controllers/collaborateControllers.js";

const router = express.Router();

// ⚠️ Static routes MUST come before dynamic /:id routes
router.get("/me/applications", validateToken, getMyApplications);

// Projects
router.get("/", getAllProjects);
router.get("/:id", validateToken, getProjectById);
router.post("/", validateToken, createProject);
router.patch("/:id/status", validateToken, updateProjectStatus);
router.delete("/:id", validateToken, deleteProject);

// Applications
router.post("/:id/apply", validateToken, applyToProject);
router.get("/:id/applications", validateToken, getProjectApplications);
router.patch("/:id/applications/:appId", validateToken, updateApplicationStatus);

// Updates feed
router.get("/:id/updates", validateToken, getProjectUpdates);
router.post("/:id/updates", validateToken, postProjectUpdate);

export default router;