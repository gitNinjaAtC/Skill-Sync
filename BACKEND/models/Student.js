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
    RegistrationNo: {
      type: String,
      trim: true,
      default: "unknown",
    },
    ClassRollNo: {
      type: String,
      trim: true,
      default: "unknown",
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
    DateOfBirth: {
      type: Date,
      default: null,
    },
    GenderName: {
      type: String,
      trim: true,
      default: "Other",
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
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Student", studentSchema);
