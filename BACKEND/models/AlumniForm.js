import mongoose from "mongoose";

const alumniFormSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  phoneNumber: { type: String, required: true },
  occupation: { type: String },
  city: { type: String },
  specialRequirements: { type: String },
  accommodation: {
    required: { type: Boolean, default: false },
    dates: { type: [String] } // Store selected dates as strings
  },
  attending: { type: String, enum: ["Yes", "No"], required: true }
}, { timestamps: true });

export default mongoose.model("AlumniForm", alumniFormSchema);
