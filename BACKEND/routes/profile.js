import express from "express";
import {
  getProfileInfo,
  updateProfile,
  uploadImageMiddleware,
  updateCoverPhoto,
  updateProfilePic,
} from "../controllers/profileControllers.js";

const router = express.Router();

router.get("/:id", getProfileInfo);
router.put("/update/:id", updateProfile);
router.put("/cover/:id", uploadImageMiddleware, updateCoverPhoto);
router.put("/profile-pic/:id", uploadImageMiddleware, updateProfilePic);

export default router;
