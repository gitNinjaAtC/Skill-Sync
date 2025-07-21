// C:\Users\Dell\Desktop\Skill-Sync\BACKEND\controllers\profileControllers.js

import User from "../models/Users.js";
import Student from "../models/Student.js"; // ✅ Add this line
import multer from "multer";
import fs from "fs";
import path from "path";
import cloudinary from "../lib/cloudinary.js";

// ====== Ensure temp directory exists ======
const uploadDir = path.resolve("uploads/tempImages");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("✅ Created upload directory:", uploadDir);
}

// ========== MULTER CONFIG ==========
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) =>
    cb(null, `${Date.now()}${path.extname(file.originalname)}`),
});

const fileFilter = (_, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only .jpeg, .jpg, and .png files are allowed"));
};

export const uploadImageMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
}).single("image");

// ========== GET PROFILE INFO ==========
export const getProfileInfo = async (req, res) => {
  const userId = req.params.id;
  if (!userId) return res.status(400).json({ message: "User ID is required" });

  try {
    const user = await User.findById(userId).select(
      "name email about facebook instagram twitter linkedin skills education experience others profilePic coverPhoto"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ Match student by email (case-insensitive)
    const student = await Student.findOne({
      EmailId: user.email?.toLowerCase(),
    });

    const profileData = {
      name: user.name || "",
      description: user.about || "",
      facebook: user.facebook || "",
      instagram: user.instagram || "",
      twitter: user.twitter || "",
      linkedin: user.linkedin || "",
      skills: user.skills || [],
      education: user.education || [],
      experience: user.experience || [],
      others: user.others || "",
      profilePic: user.profilePic || null,
      coverPhoto: user.coverPhoto || null,
      branch: student?.branch || "N/A",  // ✅ added
      batch: student?.batch || "N/A",    // ✅ added
    };

    res.status(200).json(profileData);
  } catch (error) {
    console.error("❌ Error fetching profile info:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ========== UPDATE PROFILE ==========
export const updateProfile = async (req, res) => {
  const userId = req.params.id;
  if (!userId) return res.status(400).json({ message: "User ID is required" });

  try {
    const {
      name,
      description,
      skills,
      education,
      experience,
      others,
      socialLinks = {},
    } = req.body;

    const updateFields = {
      ...(name && { name }),
      ...(description && { about: description }),
      ...(others && { others }),
      ...(socialLinks.facebook !== undefined && {
        facebook: socialLinks.facebook,
      }),
      ...(socialLinks.instagram !== undefined && {
        instagram: socialLinks.instagram,
      }),
      ...(socialLinks.twitter !== undefined && {
        twitter: socialLinks.twitter,
      }),
      ...(socialLinks.linkedin !== undefined && {
        linkedin: socialLinks.linkedin,
      }),
    };

    // ✅ Update logic to allow both strings and arrays
    if (skills !== undefined) updateFields.skills = skills;
    if (education !== undefined) updateFields.education = education;
    if (experience !== undefined) updateFields.experience = experience;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res
      .status(200)
      .json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// ========== UPDATE COVER PHOTO ==========
export const updateCoverPhoto = async (req, res) => {
  const userId = req.params.id;
  if (!req.file || !userId)
    return res.status(400).json({ message: "File and user ID are required" });

  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "skill-sync/coverPhotos",
    });

    fs.unlinkSync(req.file.path); // Delete temp file

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { coverPhoto: result.secure_url },
      { new: true }
    );

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res
      .status(200)
      .json({ message: "Cover photo updated", url: result.secure_url });
  } catch (error) {
    console.error("❌ Error updating cover photo:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// ========== UPDATE PROFILE PICTURE ==========
export const updateProfilePic = async (req, res) => {
  const userId = req.params.id;
  if (!req.file || !userId)
    return res.status(400).json({ message: "File and user ID are required" });

  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "skill-sync/profilePics",
    });

    fs.unlinkSync(req.file.path); // Delete temp file

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: result.secure_url },
      { new: true }
    );

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res
      .status(200)
      .json({ message: "Profile picture updated", url: result.secure_url });
  } catch (error) {
    console.error("❌ Error uploading profile picture:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
