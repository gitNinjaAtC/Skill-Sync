import mongoose from "mongoose";

const forumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 255,
  },
  description: {
    type: String,
    required: true,
  },
  tags: {
    type: [String], // Store tags as an array of strings
    default: [],
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const Forum = mongoose.model("Forum", forumSchema);

export default Forum;
