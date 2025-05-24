import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, maxlength: 45 },
  email: { type: String, required: true, unique: true, maxlength: 45 },
  password: { type: String, maxlength: 255, default: null },
  name: { type: String, required: true, maxlength: 45 },
  createdAt: { type: Date, default: Date.now },
  profilePic: { type: String, maxlength: 255, default: null },
  role: { type: String, required: true, default: "student", maxlength: 20 },
  about: { type: String, default: null }, // TEXT in MySQL -> String in Mongoose
  facebook: { type: String, maxlength: 255, default: null },
  instagram: { type: String, maxlength: 255, default: null },
  twitter: { type: String, maxlength: 255, default: null },
  linkedin: { type: String, maxlength: 255, default: null },
  skills: { type: String, default: null }, // TEXT -> String, or array if you want to parse skills individually
  education: { type: String, default: null },
  experience: { type: String, default: null },
  others: { type: String, default: null },
  coverPhoto: { type: String, maxlength: 255, default: null },
});

const User = mongoose.model("User", userSchema);

export default User;
