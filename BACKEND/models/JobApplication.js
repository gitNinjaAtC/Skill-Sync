import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["Registered", "In Progress", "Rejected", "Selected", "Offered"],
      default: "Registered",
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Prevent multiple applications for the same job by the same student
jobApplicationSchema.index({ jobId: 1, studentId: 1 }, { unique: true });

const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);

export default JobApplication;
