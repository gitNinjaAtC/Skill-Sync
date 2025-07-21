// C:\Users\Dell\Desktop\Skill-Sync\BACKEND\routes\profile.js

import express from "express";
import {
  getProfileInfo,
  updateProfile,
  uploadImageMiddleware,
  updateCoverPhoto,
  updateProfilePic,
} from "../controllers/profileControllers.js";

const router = express.Router();

// Get user profile info
router.get("/:id", getProfileInfo);

// Update user profile fields (bio, skills, etc.)
router.put("/update/:id", updateProfile);

// Update cover photo
router.put("/cover/:id", uploadImageMiddleware, updateCoverPhoto);

// Update profile picture
router.put("/profile-pic/:id", uploadImageMiddleware, updateProfilePic);

export default router;
