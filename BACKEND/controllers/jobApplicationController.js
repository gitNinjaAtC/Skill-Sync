import JobApplication from "../models/JobApplication.js";
import Job from "../models/Job.js";
import User from "../models/Users.js";

// APPLY TO JOB
export const applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const studentId = req.user.id;

    // Check if user is a student
    const user = await User.findById(studentId);
    if (!user || user.role !== "student") {
      return res.status(403).json({ message: "Only students can apply for jobs." });
    }

    // Check if job exists (Relaxed approval check for local testing)
    const job = await Job.findOne({ _id: jobId });
    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }

    // Check if already applied
    const existingApplication = await JobApplication.findOne({ jobId, studentId });
    if (existingApplication) {
      return res.status(400).json({ message: "You have already applied for this job." });
    }

    const newApplication = new JobApplication({
      jobId,
      studentId,
    });

    await newApplication.save();

    res.status(201).json({
      success: true,
      message: "Application submitted successfully.",
    });
  } catch (error) {
    console.error("Error applying to job:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET APPLICATIONS FOR A JOB (Alumni/Admin)
export const getApplicationsForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    const job = await Job.findById(jobId);

    if (!job) return res.status(404).json({ message: "Job not found." });

    // Only the alumni who posted the job or an admin can see applications
    if (user.role !== "admin" && String(job.user_id) !== userId) {
      return res.status(403).json({ message: "Access denied." });
    }

    const applications = await JobApplication.find({ jobId })
      .populate("studentId", "name email username profilePic")
      .sort({ appliedAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    console.error("Error fetching job applications:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// CHECK IF STUDENT HAS APPLIED
export const checkApplicationStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const studentId = req.user.id;

    const application = await JobApplication.findOne({ jobId, studentId });

    res.status(200).json({
      applied: !!application,
      status: application ? application.status : null,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET MY APPLICATIONS (Student Only)
export const getMyApplications = async (req, res) => {
  try {
    const studentId = req.user.id;
    const applications = await JobApplication.find({ studentId })
      .populate({
        path: "jobId",
        select:
          "job_title organisation_name location employment_type logo_path approval_status offer_type cost_to_company skills_required",
      })
      .sort({ appliedAt: -1 });

    // Sanitize Decimal128 fields
    const sanitizedApps = applications.map(app => {
      const appObj = app.toObject();
      if (appObj.jobId) {
        if (appObj.jobId.cost_to_company) {
          appObj.jobId.cost_to_company = appObj.jobId.cost_to_company.toString();
        }
      }
      return appObj;
    });

    res.status(200).json(sanitizedApps);
  } catch (error) {
    console.error("Error fetching my applications:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// UPDATE APPLICATION STATUS (Alumni/Admin)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    if (!["Registered", "In Progress", "Rejected", "Selected", "Offered"].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const application = await JobApplication.findById(applicationId).populate("jobId");
    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    const job = application.jobId;
    const user = await User.findById(userId);

    // Only job owner or admin can update status
    if (user.role !== "admin" && String(job.user_id) !== userId) {
      return res.status(403).json({ message: "Access denied." });
    }

    application.status = status;
    await application.save();

    res.status(200).json({ success: true, message: "Application status updated." });
  } catch (error) {
    console.error("Error updating application status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET APPLICANTS FOR ALL MY JOBS (Alumni/Faculty)
export const getApplicantsForMyJobs = async (req, res) => {
  try {
    const userId = req.user.id;

    // First find all jobs posted by this user
    const myJobs = await Job.find({ user_id: userId }).select("_id");
    const jobIds = myJobs.map(job => job._id);

    // Then find all applications for these jobs
    const applications = await JobApplication.find({ jobId: { $in: jobIds } })
      .populate("studentId", "name email username profilePic")
      .populate("jobId", "job_title organisation_name logo_path location employment_type offer_type cost_to_company fixed_gross skills_required")
      .sort({ appliedAt: -1 });

    // Sanitize Decimal128 fields
    const sanitizedApps = applications.map(app => {
      const appObj = app.toObject();
      if (appObj.jobId) {
        if (appObj.jobId.cost_to_company) {
          appObj.jobId.cost_to_company = appObj.jobId.cost_to_company.toString();
        }
        if (appObj.jobId.fixed_gross) {
          appObj.jobId.fixed_gross = appObj.jobId.fixed_gross.toString();
        }
      }
      return appObj;
    });

    res.status(200).json(sanitizedApps);
  } catch (error) {
    console.error("Error fetching applicants for my jobs:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
