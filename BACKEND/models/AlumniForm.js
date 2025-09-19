import mongoose from "mongoose";

const alumniFormSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  attending: { type: String, enum: ["Yes", "No"], required: true },
  
  // These fields are only required when attending = "Yes"
  phoneNumber: { 
    type: String, 
    required: function() {
      return this.attending === "Yes";
    }
  },
  occupation: { type: String },
  city: { type: String },
  specialRequirements: { type: String },
  accommodation: {
    required: { type: Boolean, default: false },
    dates: { type: [String] } // Store selected dates as strings
  }
}, { timestamps: true });

export default mongoose.model("AlumniForm", alumniFormSchema);