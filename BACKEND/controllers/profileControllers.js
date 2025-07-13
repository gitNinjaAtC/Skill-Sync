import User from "../models/Users.js";
import multer from "multer";
import fs from "fs";
import path from "path";

// Ensure the upload directory exists
const uploadDir = path.join(process.cwd(), "uploads/coverPhotos");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("Created upload directory:", uploadDir);
}

// Ensure the profile pictures upload directory exists
const profilePicDir = path.join(process.cwd(), "uploads/profilePics");
if (!fs.existsSync(profilePicDir)) {
  fs.mkdirSync(profilePicDir, { recursive: true });
  console.log("Created profile pictures upload directory:", profilePicDir);
}

// ========== GET PROFILE INFO ==========
export const getProfileInfo = async (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const user = await User.findById(userId).select(
      "name about facebook instagram twitter linkedin skills education experience others coverPhoto profilePic"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const profileData = {
      name: user.name,
      description: user.about,
      facebook: user.facebook,
      instagram: user.instagram,
      twitter: user.twitter,
      linkedin: user.linkedin,
      skills: user.skills,
      education: user.education,
      experience: user.experience,
      others: user.others,
      coverPhoto: user.coverPhoto,
      profilePic: user.profilePic,
    };

    res.status(200).json(profileData);
  } catch (error) {
    console.error("Error fetching profile info:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ========== UPDATE PROFILE ==========
export const updateProfile = async (req, res) => {
  const userId = req.params.id;
  const {
    name,
    description,
    socialLinks,
    skills,
    education,
    experience,
    others,
  } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const updateFields = {
      ...(name && { name }),
      ...(description && { about: description }),
      ...(skills && { skills }),
      ...(education && { education }),
      ...(experience && { experience }),
      ...(others && { others }),
      ...(socialLinks?.facebook && { facebook: socialLinks.facebook }),
      ...(socialLinks?.instagram && { instagram: socialLinks.instagram }),
      ...(socialLinks?.twitter && { twitter: socialLinks.twitter }),
      ...(socialLinks?.linkedin && { linkedin: socialLinks.linkedin }),
    };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ========== MULTER STORAGE CONFIGURATION FOR COVER PHOTO ==========
const coverStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/coverPhotos/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + ext;
    cb(null, filename);
  },
});

const coverFileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpeg, .jpg, and .png files are allowed"));
  }
};

export const uploadCoverPhotoMiddleware = multer({
  storage: coverStorage,
  fileFilter: coverFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}).single("cover");

// ========== MULTER STORAGE CONFIGURATION FOR PROFILE PICTURE ==========
const profilePicStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/profilePics/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + ext;
    cb(null, filename);
  },
});

const profilePicFileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpeg, .jpg, and .png files are allowed"));
  }
};

export const uploadProfilePicMiddleware = multer({
  storage: profilePicStorage,
  fileFilter: profilePicFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}).single("profilePic");

// ========== UPDATE COVER PHOTO ==========
export const updateCoverPhoto = async (req, res) => {
  const userId = req.params.id;

  if (!req.file || !userId) {
    return res.status(400).json({ message: "File and user ID are required" });
  }

  const filePath = `/uploads/coverPhotos/${req.file.filename}`;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { coverPhoto: filePath },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res
      .status(200)
      .json({ message: "Cover photo updated", path: filePath });
  } catch (error) {
    console.error("Error updating cover photo:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ========== UPDATE PROFILE PICTURE ==========
export const updateProfilePic = async (req, res) => {
  const userId = req.params.id;

  if (!req.file || !userId) {
    return res.status(400).json({ message: "File and user ID are required" });
  }

  const filePath = `/uploads/profilePics/${req.file.filename}`;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: filePath },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res
      .status(200)
      .json({ message: "Profile picture updated", path: filePath });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
