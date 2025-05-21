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
  { name: "offer_letter_path", maxCount: 1 },
  { name: "letter_of_intent_path", maxCount: 1 },
  { name: "logo_path", maxCount: 1 },
]);

// CREATE JOB
export const createJob = (req, res) => {
  console.log("🛑 Running createJob controller...");
  console.log("Request user:", req.user);

  upload(req, res, (err) => {
    if (err) {
      console.error("File upload error:", err);
      return res.status(500).json({ message: "File upload failed" });
    }

    if (!req.user || !req.user.id) {
      return res.status(400).json({ message: "User data missing from request" });
    }

    const userId = req.user.id;

    const roleQuery = "SELECT role FROM users WHERE id = ?";
    db.query(roleQuery, [userId], (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Internal Server Error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const userRole = results[0].role;
      if (userRole !== "Alumni") {
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
        registration_start_date,
        registration_end_date,
        employment_type,
        skills_required,
        selection_process,
      } = req.body;

      const offer_letter_path = req.files?.offer_letter_path
        ? `/Uploads/${req.files.offer_letter_path[0].filename}`
        : null;
      const letter_of_intent_path = req.files?.letter_of_intent_path
        ? `/Uploads/${req.files.letter_of_intent_path[0].filename}`
        : null;
      const logo_path = req.files?.logo_path
        ? `/Uploads/${req.files.logo_path[0].filename}`
        : null;

      if (!job_title || !organisation_name) {
        return res.status(400).json({ message: "Job title and organisation name are required" });
      }

      const insertQuery = `
        INSERT INTO jobs (
          job_title, organisation_name, offer_type, joining_date, location,
          remote_working, cost_to_company, fixed_gross, bonuses, offer_letter_path,
          letter_of_intent_path, job_description, bond_details, other_benefits,
          registration_start_date, registration_end_date, employment_type,
          skills_required, selection_process, logo_path,
          approval_status, user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?)
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
        registration_start_date || null,
        registration_end_date || null,
        employment_type || null,
        skills_required || null,
        selection_process || null,
        logo_path,
        userId,
      ];

      db.query(insertQuery, values, (err, result) => {
        if (err) {
          console.error("Error creating job:", err);
          return res.status(500).json({ message: "Internal Server Error" });
        }

        return res.status(201).json({
          success: true,
          message: "Job submitted for approval",
          jobId: result.insertId,
        });
      });
    });
  });
};

// APPROVE JOB
export const approveJob = (req, res) => {
  console.log("🛑 Running approveJob controller...");
  if (!req.user || !req.user.id) {
    return res.status(400).json({ message: "User data missing from request" });
  }

  const userId = req.user.id;
  const jobId = req.params.jobId;

  const roleQuery = "SELECT role FROM users WHERE id = ?";
  db.query(roleQuery, [userId], (err, results) => {
    if (err) return res.status(500).json({ message: "Internal Server Error" });
    if (results.length === 0) return res.status(404).json({ message: "User not found" });

    const userRole = results[0].role;
    if (userRole !== "Admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    const checkQuery = "SELECT approval_status FROM jobs WHERE job_id = ?";
    db.query(checkQuery, [jobId], (err, results) => {
      if (err) return res.status(500).json({ message: "Internal Server Error" });
      if (results.length === 0) return res.status(404).json({ message: "Job not found" });
      if (results[0].approval_status === "Approved") {
        return res.status(400).json({ message: "Job is already approved" });
      }

      const updateQuery = "UPDATE jobs SET approval_status = 'Approved' WHERE job_id = ?";
      db.query(updateQuery, [jobId], (err, result) => {
        if (err) return res.status(500).json({ message: "Internal Server Error" });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Job not found" });

        return res.status(200).json({ success: true, message: "Job approved successfully" });
      });
    });
  });
};

// GET ALL APPROVED JOBS
export const getJobs = (req, res) => {
  console.log("🛑 Running getJobs controller...");

  const query = `
    SELECT j.job_id, j.job_title, j.organisation_name, j.offer_type, j.joining_date, j.location,
           j.remote_working, j.cost_to_company, j.fixed_gross, j.bonuses, j.offer_letter_path,
           j.letter_of_intent_path, j.job_description, j.bond_details, j.other_benefits,
           j.registration_start_date, j.registration_end_date, j.employment_type,
           j.skills_required, j.selection_process, j.logo_path, j.created_at,
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

    return res.status(200).json(results);
  });
};

// ✅ NEW: GET SINGLE JOB BY ID
export const getJobById = (req, res) => {
  const jobId = req.params.id;
  const query = `
    SELECT j.job_id, j.job_title, j.organisation_name, j.offer_type, j.joining_date, j.location,
           j.remote_working, j.cost_to_company, j.fixed_gross, j.bonuses, j.offer_letter_path,
           j.letter_of_intent_path, j.job_description, j.bond_details, j.other_benefits,
           j.registration_start_date, j.registration_end_date, j.employment_type,
           j.skills_required, j.selection_process, j.logo_path, j.created_at,
           COALESCE(u.name, u.username) AS posted_by
    FROM jobs j
    JOIN users u ON j.user_id = u.id
    WHERE j.job_id = ? AND j.approval_status = 'Approved'
  `;

  db.query(query, [jobId], (err, results) => {
    if (err) {
      console.error("Error fetching job by ID:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Job not found" });
    }

    return res.status(200).json(results[0]);
  });
};
