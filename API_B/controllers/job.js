import { db } from "../connect.js";
import multer from "multer";
import path from "path";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage }).fields([
  { name: "offer_letter", maxCount: 1 },
  { name: "letter_of_intent", maxCount: 1 },
]);

export const createJob = (req, res) => {
  console.log("🛑 Running createJob controller...");
  console.log("Request user:", req.user);

  upload(req, res, (err) => {
    if (err) {
      console.error("File upload error:", err);
      return res.status(500).json({ message: "File upload failed" });
    }

    if (!req.user || !req.user.id) {
      console.log("Error: User data missing from request");
      return res
        .status(400)
        .json({ message: "User data missing from request" });
    }

    const userId = req.user.id;

    const roleQuery = "SELECT role FROM users WHERE id = ?";
    db.query(roleQuery, [userId], (err, results) => {
      if (err) {
        console.error("Error fetching user role:", err);
        return res.status(500).json({ message: "Internal Server Error" });
      }

      if (results.length === 0) {
        console.log("Error: User not found, id:", userId);
        return res.status(404).json({ message: "User not found" });
      }

      const userRole = results[0].role;
      console.log("User role:", userRole);

      if (userRole !== "Alumni") {
        console.log("Access denied: User is not Alumni, role:", userRole);
        return res.status(403).json({ message: "Access denied: Alumni only" });
      }

      const {
        job_title,
        organisation_name,
        offer_type,
        joining_date,
        location,
        remote_working,
        cost_to_company = 0.0,
        fixed_gross = 0.0,
        bonuses,
        job_description,
        bond_details,
        other_benefits,
      } = req.body;

      const offer_letter_path = req.files?.offer_letter
        ? `/Uploads/${req.files.offer_letter[0].filename}`
        : null;
      const letter_of_intent_path = req.files?.letter_of_intent
        ? `/Uploads/${req.files.letter_of_intent[0].filename}`
        : null;

      if (!job_title || !organisation_name) {
        console.log(
          "Invalid request: job_title and organisation_name are required"
        );
        return res
          .status(400)
          .json({ message: "Job title and organisation name are required" });
      }

      const insertQuery = `
        INSERT INTO jobs (
          job_title, organisation_name, offer_type, joining_date, location,
          remote_working, cost_to_company, fixed_gross, bonuses, offer_letter_path,
          letter_of_intent_path, job_description, bond_details, other_benefits,
          approval_status, user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?)
      `;
      const values = [
        job_title,
        organisation_name,
        offer_type || null,
        joining_date || null,
        location || null,
        remote_working || null,
        cost_to_company,
        fixed_gross,
        bonuses || null,
        offer_letter_path,
        letter_of_intent_path,
        job_description || null,
        bond_details || null,
        other_benefits || null,
        userId,
      ];

      db.query(insertQuery, values, (err, result) => {
        if (err) {
          console.error("Error creating job:", err);
          return res.status(500).json({ message: "Internal Server Error" });
        }

        console.log("Job created, id:", result.insertId);
        return res.status(201).json({
          success: true,
          message: "Job submitted for approval",
          jobId: result.insertId,
        });
      });
    });
  });
};

export const approveJob = (req, res) => {
  console.log("🛑 Running approveJob controller...");
  console.log("Request user:", req.user);

  if (!req.user || !req.user.id) {
    console.log("Error: User data missing from request");
    return res.status(400).json({ message: "User data missing from request" });
  }

  const userId = req.user.id;
  const jobId = req.params.jobId;

  const roleQuery = "SELECT role FROM users WHERE id = ?";
  db.query(roleQuery, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching user role:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (results.length === 0) {
      console.log("Error: User not found, id:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    const userRole = results[0].role;
    console.log("User role:", userRole);

    if (userRole !== "Admin") {
      console.log("Access denied: User is not Admin, role:", userRole);
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    const checkQuery = "SELECT approval_status FROM jobs WHERE job_id = ?";
    db.query(checkQuery, [jobId], (err, results) => {
      if (err) {
        console.error("Error checking job:", err);
        return res.status(500).json({ message: "Internal Server Error" });
      }

      if (results.length === 0) {
        console.log("Error: Job not found, id:", jobId);
        return res.status(404).json({ message: "Job not found" });
      }

      if (results[0].approval_status === "Approved") {
        console.log("Job already approved, id:", jobId);
        return res.status(400).json({ message: "Job is already approved" });
      }

      const updateQuery =
        "UPDATE jobs SET approval_status = 'Approved' WHERE job_id = ?";
      db.query(updateQuery, [jobId], (err, result) => {
        if (err) {
          console.error("Error approving job:", err);
          return res.status(500).json({ message: "Internal Server Error" });
        }

        if (result.affectedRows === 0) {
          console.log("Error: Job not found or no changes made, id:", jobId);
          return res.status(404).json({ message: "Job not found" });
        }

        console.log("Job approved, id:", jobId);
        return res
          .status(200)
          .json({ success: true, message: "Job approved successfully" });
      });
    });
  });
};

export const getJobs = (req, res) => {
  console.log("🛑 Running getJobs controller...");

  const query = `
    SELECT j.job_id, j.job_title, j.organisation_name, j.offer_type, j.joining_date, j.location,
           j.remote_working, j.cost_to_company, j.fixed_gross, j.bonuses, j.offer_letter_path,
           j.letter_of_intent_path, j.job_description, j.bond_details, j.other_benefits, j.created_at,
           COALESCE(u.name, u.username) AS posted_by
    FROM jobs j
    JOIN users u ON j.user_id = u.id
    WHERE j.approval_status = 'Approved'
    ORDER BY j.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching jobs:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    console.log("Fetched jobs:", results.length);
    return res.status(200).json(results);
  });
};
