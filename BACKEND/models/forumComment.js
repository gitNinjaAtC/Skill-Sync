// models/ForumComment.js
import mongoose from "mongoose";

const forumCommentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    forum: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Forum",
      required: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const ForumComment = mongoose.model("ForumComment", forumCommentSchema);

export default ForumComment;
