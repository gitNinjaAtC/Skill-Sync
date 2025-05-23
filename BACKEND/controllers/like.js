import Like from "../models/Like.js";
import User from "../models/Users.js";

// Add a like
export const addLike = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.body;

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
    const postId = req.params.postId;

    const result = await Like.findOneAndDelete({ userId, postId });

    if (!result) {
      return res.status(404).json("Like not found.");
    }

    res.status(200).json("Post unliked.");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all users who liked a post
export const getLikes = async (req, res) => {
  try {
    const postId = req.params.postId;

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
