import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    EnrollmentNo: {
      type: String,
      trim: true,
      default: "unknown",
    },
    StudentName: {
      type: String,
      trim: true,
      default: "Unknown",
    },

    EmailId: {
      type: String,
      trim: true,
      lowercase: true,
      default: "unknown",
    },
    MobileNo: {
      type: String,
      trim: true,
      default: "0000000000",
    },

    batch: {
      type: String,
      trim: true,
      match: [/^\d{4}-\d{4}$/, "Batch must be in the format YYYY-YYYY"],
    },
    branch: {
      type: String,
      trim: true,
      default: "Unknown",
    },
    role: {
      type: String,
      trim: true,
      default: "student",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Student", studentSchema);
