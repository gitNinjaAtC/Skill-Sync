import express from "express";
import {
  getProfileInfo,
  updateProfile,
  uploadCoverPhotoMiddleware,
  updateCoverPhoto,
  uploadProfilePicMiddleware,
  updateProfilePic,
} from "../controllers/profileControllers.js";

const router = express.Router();

// GET /API_B/profile/:id
router.get("/:id", getProfileInfo);

// PUT /API_B/profile/update/:id
router.put("/update/:id", updateProfile);

// PUT /API_B/profile/cover/:id
router.put("/cover/:id", uploadCoverPhotoMiddleware, updateCoverPhoto);

// PUT /API_B/profile/profilePic/:id
router.put("/profilePic/:id", uploadProfilePicMiddleware, updateProfilePic);

export default router;
