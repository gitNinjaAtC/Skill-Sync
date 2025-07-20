import User from "../models/Users.js";
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
  filename: (_, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`),
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
      "name about facebook instagram twitter linkedin skills education experience others profilePic coverPhoto"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

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

    // ✅ Normalize comma-separated strings into arrays (or handle if already arrays)
    const parseArray = (input) => {
      if (!input) return [];
      if (Array.isArray(input)) return input;
      return input
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    };

    const updateFields = {
      ...(name && { name }),
      ...(description && { about: description }),
      skills: parseArray(skills),
      education: parseArray(education),
      experience: parseArray(experience),
      ...(others && { others }),
      ...(socialLinks.facebook !== undefined && { facebook: socialLinks.facebook }),
      ...(socialLinks.instagram !== undefined && { instagram: socialLinks.instagram }),
      ...(socialLinks.twitter !== undefined && { twitter: socialLinks.twitter }),
      ...(socialLinks.linkedin !== undefined && { linkedin: socialLinks.linkedin }),
    };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
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

    fs.unlinkSync(req.file.path); // Clean up temp file

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { coverPhoto: result.secure_url },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "Cover photo updated", url: result.secure_url });
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

    fs.unlinkSync(req.file.path); // Clean up temp file

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: result.secure_url },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "Profile picture updated", url: result.secure_url });
  } catch (error) {
    console.error("❌ Error uploading profile picture:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
