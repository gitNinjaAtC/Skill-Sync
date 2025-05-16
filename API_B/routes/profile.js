import express from "express";
import {
  getProfileInfo,
  updateProfile,
  uploadCoverPhotoMiddleware,
  updateCoverPhoto,
} from "../controllers/profileControllers.js";

const router = express.Router();

// GET /API_B/profile/:id
router.get("/:id", getProfileInfo);

// PUT /API_B/profile/update/:id
router.put("/update/:id", updateProfile);

// ✅ NEW: PUT /API_B/profile/cover/:id
router.put("/cover/:id", uploadCoverPhotoMiddleware, updateCoverPhoto);

export default router;
