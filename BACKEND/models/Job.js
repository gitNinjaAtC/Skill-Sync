import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  job_title: { type: String, required: true, maxlength: 255 },
  organisation_name: { type: String, required: true, maxlength: 255 },
  offer_type: { type: String, maxlength: 100, default: null },
  joining_date: { type: Date, default: null },
  location: { type: String, default: null }, // TEXT → String (no length limit)
  remote_working: { type: String, maxlength: 100, default: null },
  cost_to_company: {
    type: mongoose.Types.Decimal128,
    required: true,
    default: 0.0,
  },
  fixed_gross: { type: mongoose.Types.Decimal128, default: 0.0 },
  bonuses: { type: String, default: null },
  offer_letter_path: { type: String, maxlength: 500, default: null },
  letter_of_intent_path: { type: String, maxlength: 500, default: null },
  job_description: { type: String, default: null },
  bond_details: { type: String, default: null },
  other_benefits: { type: String, default: null },
  registration_start_date: { type: Date, default: null },
  registration_end_date: { type: Date, default: null },
  employment_type: { type: String, maxlength: 100, default: null },
  skills_required: { type: String, default: null },
  selection_process: { type: String, default: null },
  logo_path: { type: String, maxlength: 500, default: null },
  approval_status: {
    type: String,
    enum: ["Pending", "Approved"],
    default: "Approved",
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// Middleware to update `updated_at` on document update
jobSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

const Job = mongoose.model("Job", jobSchema);

export default Job;
