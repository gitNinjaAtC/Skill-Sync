import mongoose from "mongoose";

const pendingPostSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users", // Reference to the User collection
    required: true,
  },
  desc: {
    type: String, // TEXT in MySQL → String in Mongoose
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const PendingPost = mongoose.model("PendingPost", pendingPostSchema);

export default PendingPost;
