import multer from "multer";
import path from "path";
import Job from "../models/Job.js";
import User from "../models/Users.js";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
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
export const createJob = async (req, res) => {
  console.log("🚩 Running createJob controller...");
  console.log("Request user:", req.user);

  upload(req, res, async (err) => {
    if (err) {
      console.error("File upload error:", err);
      return res.status(500).json({ message: "File upload failed" });
    }

    if (!req.user || !req.user.id) {
      return res
        .status(400)
        .json({ message: "User data missing from request" });
    }

    const userId = req.user.id;

    try {
      const user = req.user;
      if (!["alumni", "admin", "faculty"].includes(user.role?.toLowerCase()))
        return res.status(403).json({ message: "Access denied: Authorized users only" });

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
        ? `/uploads/${req.files.offer_letter_path[0].filename}`
        : null;
      const letter_of_intent_path = req.files?.letter_of_intent_path
        ? `/uploads/${req.files.letter_of_intent_path[0].filename}`
        : null;
      const logo_path = req.files?.logo_path
        ? `/uploads/${req.files.logo_path[0].filename}`
        : null;

      if (!job_title || !organisation_name) {
        return res
          .status(400)
          .json({ message: "Job title and organisation name are required" });
      }

      const newJob = new Job({
        job_title,
        organisation_name,
        offer_type,
        joining_date,
        location,
        remote_working,
        cost_to_company,
        fixed_gross,
        bonuses,
        job_description,
        bond_details,
        other_benefits,
        registration_start_date,
        registration_end_date,
        employment_type,
        skills_required,
        selection_process,
        offer_letter_path,
        letter_of_intent_path,
        logo_path,
        user_id: userId,
      });

      const savedJob = await newJob.save();

      res.status(201).json({
        success: true,
        message: "Job submitted for approval",
        jobId: savedJob._id,
      });
    } catch (error) {
      console.error("Error creating job:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
};

// APPROVE JOB
export const approveJob = async (req, res) => {
  console.log("🚩 Running approveJob controller...");
  if (!req.user || !req.user.id) {
    return res.status(400).json({ message: "User data missing from request" });
  }

  const userId = req.user.id;
  const jobId = req.params.jobId;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "admin")
      return res.status(403).json({ message: "Access denied: Admins only" });

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.approval_status === "Approved") {
      return res.status(400).json({ message: "Job is already approved" });
    }

    job.approval_status = "Approved";
    await job.save();

    res
      .status(200)
      .json({ success: true, message: "Job approved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// REJECT JOB
export const rejectJob = async (req, res) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }

  const jobId = req.params.jobId;

  try {
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    job.approval_status = "Rejected";
    await job.save();

    res.status(200).json({ success: true, message: "Job rejected successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET ALL APPROVED JOBS
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ 
      approval_status: "Approved",
      $or: [
        { registration_end_date: { $gte: new Date() } },
        { registration_end_date: null }
      ]
    })
      .populate("user_id", "name username")
      .sort({ created_at: -1 });

    const sanitizedJobs = jobs.map((job) => ({
      job_id: job._id,
      job_title: job.job_title,
      organisation_name: job.organisation_name,
      offer_type: job.offer_type,
      joining_date: job.joining_date,
      location: job.location,
      remote_working: job.remote_working,
      cost_to_company: job.cost_to_company?.toString(),
      fixed_gross: job.fixed_gross?.toString(),
      bonuses: job.bonuses,
      offer_letter_path: job.offer_letter_path,
      letter_of_intent_path: job.letter_of_intent_path,
      job_description: job.job_description,
      bond_details: job.bond_details,
      other_benefits: job.other_benefits,
      registration_start_date: job.registration_start_date,
      registration_end_date: job.registration_end_date,
      employment_type: job.employment_type,
      skills_required: job.skills_required,
      selection_process: job.selection_process,
      logo_path: job.logo_path,
      created_at: job.created_at,
      posted_by: job.user_id?.name || job.user_id?.username || "Unknown",
    }));

    res.status(200).json(sanitizedJobs);
  } catch (err) {
    console.error("Error fetching jobs:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET SINGLE JOB BY ID
export const getJobById = async (req, res) => {
  const jobId = req.params.id;

  try {
    const job = await Job.findById(jobId).populate("user_id", "name username");

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Only allow viewing if Approved, or if user is Admin, or if user is the Owner
    const isAdmin = req.user?.role === "admin";
    const isOwner = req.user?.id?.toString() === job.user_id?._id?.toString();

    if (job.approval_status !== "Approved" && !isAdmin && !isOwner) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Convert Decimal128 fields to strings
    const jobObj = job.toObject();
    jobObj.cost_to_company = job.cost_to_company?.toString();
    jobObj.fixed_gross = job.fixed_gross?.toString();

    const result = {
      ...jobObj,
      posted_by: job.user_id.name || job.user_id.username || "Unknown",
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching job by ID:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET JOBS POSTED BY CURRENT USER (Alumni/Faculty)
export const getMyJobs = async (req, res) => {
  try {
    const userId = req.user.id;
    const jobs = await Job.find({ user_id: userId }).sort({ created_at: -1 });
    
    const sanitizedJobs = jobs.map(job => {
      const obj = job.toObject();
      return {
        ...obj,
        cost_to_company: job.cost_to_company?.toString(),
        fixed_gross: job.fixed_gross?.toString()
      };
    });

    res.status(200).json(sanitizedJobs);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET PENDING JOBS (Admin Only)
export const getPendingJobs = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }
    const jobs = await Job.find({ approval_status: "Pending" })
      .populate("user_id", "name username")
      .sort({ created_at: -1 });

    const result = jobs.map((job) => {
      const obj = job.toObject();
      return {
        ...obj,
        cost_to_company: job.cost_to_company?.toString(),
        fixed_gross: job.fixed_gross?.toString(),
        posted_by: job.user_id?.name || job.user_id?.username || "Unknown",
      };
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET JOB STATS (Admin Only)
export const getJobStats = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const stats = await Job.aggregate([
      {
        $group: {
          _id: "$approval_status",
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      Pending: 0,
      Approved: 0,
      Rejected: 0,
      Total: 0,
    };

    stats.forEach((s) => {
      if (s._id) {
        result[s._id] = s.count;
        result.Total += s.count;
      }
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching job stats:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET ALL JOBS FOR ADMIN (With status filter)
export const getAdminJobs = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { status } = req.query; // Pending, Approved, Rejected
    const query = status ? { approval_status: status } : {};

    const jobs = await Job.find(query)
      .populate("user_id", "name username")
      .sort({ created_at: -1 });

    const result = jobs.map((job) => {
      const obj = job.toObject();
      return {
        ...obj,
        cost_to_company: job.cost_to_company?.toString(),
        fixed_gross: job.fixed_gross?.toString(),
        posted_by: job.user_id?.name || job.user_id?.username || "Unknown",
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching admin jobs:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
