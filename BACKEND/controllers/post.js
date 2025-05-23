import Post from "../models/Post.js";
import PendingPost from "../models/PendingPost.js";
import User from "../models/Users.js";

// GET ALL POSTS
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate("userId", "name profilePic")
      .sort({ createdAt: -1 });

    // Map to flatten user info on top level for frontend convenience
    const formattedPosts = posts.map((post) => {
      const postObj = post.toObject(); // convert mongoose doc to plain JS object
      return {
        ...postObj,
        id: postObj._id,
        name: postObj.userId?.name || "User",
        profilePic: postObj.userId?.profilePic || "/default-avatar.png",
        userId: postObj.userId?._id || null, // keep userId for link routing
      };
    });

    res.status(200).json(formattedPosts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ error: err.message });
  }
};

// ADD NEW POST
export const addPost = async (req, res) => {
  const userId = req.user.id;
  const { desc } = req.body;

  if (!desc)
    return res.status(400).json({ message: "Post content is required" });

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "Admin") {
      const newPost = new Post({ userId, desc, status: "approved" });
      await newPost.save();
      return res.status(201).json({
        success: true,
        message: "Post created successfully",
        postId: newPost._id,
      });
    } else if (user.role === "Alumni") {
      const pendingPost = new PendingPost({ userId, desc });
      await pendingPost.save();
      return res.status(201).json({
        success: true,
        message: "Post sent for admin approval",
        pendingPostId: pendingPost._id,
      });
    } else {
      return res
        .status(403)
        .json({ message: "Access denied: Only Alumni and Admins can post" });
    }
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ error: err.message });
  }
};

// ADMIN REVIEW POST
export const reviewPost = async (req, res) => {
  const userId = req.user.id;
  const { postId, action } = req.body;

  if (!postId || !["approved", "declined"].includes(action)) {
    return res.status(400).json({ message: "Invalid request" });
  }

  try {
    const user = await User.findById(userId);
    if (!user || user.role !== "Admin")
      return res.status(403).json({ message: "Access denied: Admins only" });

    const pendingPost = await PendingPost.findById(postId);
    if (!pendingPost)
      return res.status(404).json({ message: "Pending post not found" });

    if (action === "approved") {
      const approvedPost = new Post({
        userId: pendingPost.userId,
        desc: pendingPost.desc,
        createdAt: pendingPost.createdAt,
        status: "approved",
      });
      await approvedPost.save();
    }

    await PendingPost.findByIdAndDelete(postId);
    return res
      .status(200)
      .json({ success: true, message: `Post ${action} successfully` });
  } catch (err) {
    console.error("Error reviewing post:", err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE POST
export const deletePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  if (!postId) return res.status(400).json({ message: "Post ID is required" });

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role !== "Admin" && post.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Access denied: You cannot delete this post" });
    }

    await Post.findByIdAndDelete(postId);
    return res
      .status(200)
      .json({ success: true, message: "Post deleted successfully" });
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({ error: err.message });
  }
};
