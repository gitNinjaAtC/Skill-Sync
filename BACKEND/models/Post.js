// models/Post.js
import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  desc: { type: String, required: true, maxlength: 499 },
  img: { type: String, required: false, maxlength: 105 },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "declined"],
    default: "pending",
  },
});

export default mongoose.model("Post", postSchema);
