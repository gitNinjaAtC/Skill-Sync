import mongoose from "mongoose";

const pendingPostSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  desc: {
    type: String,
    default: "",
  },
  img: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const PendingPost = mongoose.model("PendingPost", pendingPostSchema);

export default PendingPost;
