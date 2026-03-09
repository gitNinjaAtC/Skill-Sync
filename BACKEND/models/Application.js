import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    note: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// One application per student per project
applicationSchema.index({ projectId: 1, studentId: 1 }, { unique: true });

export default mongoose.model("Application", applicationSchema);