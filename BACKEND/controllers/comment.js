import Comment from "../models/Comment.js"; // Adjust the path accordingly
import User from "../models/Users.js"; // To populate user info
import mongoose from "mongoose";

// GET comments for a specific post
export const getComments = async (req, res) => {
  const postId = req.params.postId;
  console.log("Received postId:", postId);

  if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
    return res
      .status(400)
      .json({ message: "Invalid or missing postId parameter" });
  }

  try {
    const comments = await Comment.find({ postId })
      .populate("userId", "name profilePic")
      .sort({ createdAt: -1 });

    return res.status(200).json(comments);
  } catch (err) {
    console.error("Error fetching comments:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ADD a new comment
export const addComment = async (req, res) => {
  const userId = req.user.id;
  const { postId, comment } = req.body;
  console.log("addComment req.body:", req.body);

  if (!postId || !comment) {
    return res
      .status(400)
      .json({ message: "Post ID and comment are required" });
  }

  try {
    // Create and save comment
    const newComment = new Comment({ postId, userId, comment });
    await newComment.save();

    return res.status(201).json({ success: true, commentId: newComment._id });
  } catch (err) {
    console.error("Error adding comment:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// import { db } from "../connect.js";

// // GET comments for a specific post
// export const getComments = (req, res) => {
//   const postId = req.params.postId;

//   const q = `
//     SELECT c.*, u.name, u.profilePic
//     FROM comments AS c
//     JOIN users AS u ON c.userId = u.id
//     WHERE c.postId = ?
//     ORDER BY c.createdAt DESC
//   `;

//   db.query(q, [postId], (err, data) => {
//     if (err) return res.status(500).json(err);
//     return res.status(200).json(data);
//   });
// };

// // ADD a new comment
// export const addComment = (req, res) => {
//   const userId = req.user.id;
//   const { postId, comment } = req.body;

//   if (!postId || !comment) {
//     return res
//       .status(400)
//       .json({ message: "Post ID and comment are required" });
//   }

//   const q = `
//     INSERT INTO comments (postId, userId, comment)
//     VALUES (?, ?, ?)
//   `;

//   db.query(q, [postId, userId, comment], (err, result) => {
//     if (err) return res.status(500).json(err);
//     return res.status(201).json({ success: true, commentId: result.insertId });
//   });
// };
