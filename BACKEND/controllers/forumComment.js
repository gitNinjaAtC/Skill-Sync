import ForumComment from "../models/forumComment.js";

export const getCommentsForForum = async (req, res) => {
  try {
    const forumId = req.params.id;
    const comments = await ForumComment.find({ forum: forumId })
      .populate("created_by", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching comments", error: err.message });
  }
};

export const createCommentForForum = async (req, res) => {
  try {
    const forumId = req.params.id;
    const { text, userId } = req.body; // ✅ Get userId from frontend

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const newComment = new ForumComment({
      text,
      forum: forumId,
      created_by: userId,
    });

    await newComment.save();
    const populatedComment = await newComment.populate("created_by", "name");
    res.status(201).json(populatedComment);
  } catch (err) {
    res.status(500).json({ message: "Error creating comment", error: err.message });
  }
};
