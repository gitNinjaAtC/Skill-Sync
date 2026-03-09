import mongoose from "mongoose";

const alumniUpdateSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    note: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: "Update", // e.g., Promotion, New Job, Award, Higher Studies
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("AlumniUpdate", alumniUpdateSchema);
