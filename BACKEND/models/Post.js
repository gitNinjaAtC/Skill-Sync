// models/Post.js
import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  desc: { type: String, default: "", maxlength: 2000 },
  img: { type: String, default: null, maxlength: 500 }, // Cloudinary URLs can be long
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "declined"],
    default: "pending",
  },
});

export default mongoose.model("Post", postSchema);
