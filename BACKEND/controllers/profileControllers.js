import { db } from "../connect.js";
import multer from "multer";
import fs from "fs";
import path from "path";

// Ensure the upload directory exists
const uploadDir = path.join(process.cwd(), "uploads/coverPhotos");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("Created upload directory:", uploadDir);
}

// ========== GET PROFILE INFO ==========
export const getProfileInfo = (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const query = `
    SELECT 
      name,
      about AS description,
      facebook,
      instagram,
      twitter,
      linkedin,
      skills,
      education,
      experience,
      others
    FROM users
    WHERE id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching profile info:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(results[0]);
  });
};

// ========== UPDATE PROFILE ==========
export const updateProfile = (req, res) => {
  const userId = req.params.id;
  const { name, description, socialLinks, skills, education, experience, others } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const query = `
    UPDATE users SET 
      name = ?, 
      about = ?, 
      facebook = ?, 
      instagram = ?, 
      twitter = ?, 
      linkedin = ?,
      skills = ?,
      education = ?,
      experience = ?,
      others = ?
    WHERE id = ?
  `;

  const values = [
    name || null,
    description || null,
    socialLinks?.facebook || null,
    socialLinks?.instagram || null,
    socialLinks?.twitter || null,
    socialLinks?.linkedin || null,
    skills || null,
    education || null,
    experience || null,
    others || null,
    userId,
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Error updating profile:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    return res.status(200).json({ message: "Profile updated successfully" });
  });
};

// ========== MULTER STORAGE CONFIGURATION ==========
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/coverPhotos/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + ext;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpeg, .jpg, and .png files are allowed"));
  }
};

export const uploadCoverPhotoMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}).single("cover");

// ========== UPDATE COVER PHOTO ==========
export const updateCoverPhoto = (req, res) => {
  const userId = req.params.id;

  if (!req.file || !userId) {
    return res.status(400).json({ message: "File and user ID are required" });
  }

  const filePath = `/uploads/coverPhotos/${req.file.filename}`;

  const query = `UPDATE users SET coverPhoto = ? WHERE id = ?`;

  db.query(query, [filePath, userId], (err) => {
    if (err) {
      console.error("Error updating cover photo:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    return res.status(200).json({ message: "Cover photo updated", path: filePath });
  });
};
