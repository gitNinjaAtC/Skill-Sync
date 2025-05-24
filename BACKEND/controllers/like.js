import Like from "../models/Like.js";
import User from "../models/Users.js";
import mongoose from "mongoose";

// Add a like
export const addLike = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: "Invalid post ID" });
    }

    const like = new Like({ userId, postId });
    await like.save();

    res.status(200).json("Post liked.");
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate key error (violates unique index)
      return res.status(400).json("Post already liked.");
    }
    res.status(500).json({ error: err.message });
  }
};

// Remove a like
export const removeLike = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: "Invalid post ID" });
    }

    const result = await Like.findOneAndDelete({
      userId: new mongoose.Types.ObjectId(userId),
      postId: new mongoose.Types.ObjectId(postId),
    });

    if (!result) {
      return res.status(404).json({ error: "Like not found" });
    }

    res.status(200).json("Post unliked.");
  } catch (err) {
    console.error("removeLike: Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get all users who liked a post
export const getLikes = async (req, res) => {
  try {
    const { postId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: "Invalid post ID" });
    }

    const likes = await Like.find({ postId }).populate("userId", "id name");

    const users = likes.map((like) => ({
      id: like.userId._id,
      name: like.userId.name,
    }));

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get like status for a specific post and user
export const getLikeStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: "Invalid post ID" });
    }

    const like = await Like.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      postId: new mongoose.Types.ObjectId(postId),
    });

    res.status(200).json({ liked: !!like });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
