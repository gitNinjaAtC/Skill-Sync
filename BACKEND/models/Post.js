import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  desc: { type: String, required: true, maxlength: 499 },
  img: { type: String, required: false, maxlength: 105 },
  userId: { type: String, required: true, maxlength: 45 },
  createdAt: { type: Date, default: Date.now, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "declined"],
    default: "pending",
  },
});

const Post = mongoose.model("Post", postSchema);

export default Post;
