import Post from "../models/Post.js";
import PendingPost from "../models/PendingPost.js";
import User from "../models/Users.js";
import cloudinary from "../lib/cloudinary.js";

// GET ALL POSTS
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate("userId", "name profilePic")
      .sort({ createdAt: -1 });

    const formattedPosts = posts.map((post) => {
      const postObj = post.toObject();
      return {
        ...postObj,
        id: postObj._id,
        name: postObj.userId?.name || "User",
        profilePic:
          postObj.userId?.profilePic && postObj.userId.profilePic.trim() !== ""
            ? postObj.userId.profilePic
            : null,
        userId: postObj.userId?._id || null,
      };
    });

    res.status(200).json(formattedPosts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ error: err.message });
  }
};


// ADD NEW POST (with optional Cloudinary image)
export const addPost = async (req, res) => {
  const userId = req.user.id;
  const { desc, image } = req.body;

  if (!desc && !image)
    return res.status(400).json({ message: "Post content or image is required" });

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Upload image to Cloudinary if provided
    let imageUrl = null;
    if (image) {
      try {
        const uploadResult = await cloudinary.uploader.upload(image, {
          folder: "postImages",
          transformation: [
            { width: 1280, height: 1280, crop: "limit" },
            { quality: "auto:good" },
          ],
        });
        imageUrl = uploadResult.secure_url;
      } catch (uploadErr) {
        console.error("Cloudinary upload error:", uploadErr);
        return res.status(500).json({ message: "Image upload failed. Please try again." });
      }
    }

    if (user.role === "admin" || user.role === "faculty") {
      const newPost = new Post({ userId, desc: desc || "", img: imageUrl, status: "approved" });
      await newPost.save();
      return res.status(201).json({
        success: true,
        message: "Post created successfully",
        postId: newPost._id,
      });
    } else if (user.role === "alumni") {
      const pendingPost = new PendingPost({ userId, desc: desc || "", img: imageUrl });
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


// APPROVE or REJECT post
export const reviewPost = async (req, res) => {
  const { postId, action } = req.body;

  try {
    const pendingPost = await PendingPost.findById(postId);
    if (!pendingPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (action === "approved") {
      try {
        const approvedPost = new Post({
          userId: pendingPost.userId,
          desc: pendingPost.desc,
          img: pendingPost.img || null,
          createdAt: pendingPost.createdAt ? new Date(pendingPost.createdAt) : new Date(),
          status: "approved",
        });

        await approvedPost.save();
      } catch (saveError) {
        console.error("🔥 Error saving approved post:", saveError.message);
        return res.status(500).json({
          error: "Failed to approve post",
          reason: saveError.message,
        });
      }
    }

    await PendingPost.findByIdAndDelete(postId);
    res.status(200).json({ message: `Post ${action} successfully` });

  } catch (error) {
    console.error("🔥 Error in reviewPost controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
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

    if (user.role !== "admin" && post.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Access denied: You cannot delete this post" });
    }

    // Optionally delete image from Cloudinary
    if (post.img) {
      try {
        // Extract public_id from URL (e.g. postImages/abc123)
        const urlParts = post.img.split("/");
        const publicId = urlParts.slice(-2).join("/").split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudErr) {
        console.warn("Could not delete image from Cloudinary:", cloudErr.message);
      }
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


export const getPendingPosts = async (req, res) => {
  try {
    const pendingPosts = await PendingPost.find({})
      .populate("userId", "name profilePic")
      .sort({ createdAt: -1 });

    const formattedPosts = pendingPosts.map((post) => {
      const postObj = post.toObject();
      return {
        ...postObj,
        id: postObj._id,
        name: postObj.userId?.name || "User",
        profilePic:
          postObj.userId?.profilePic && postObj.userId.profilePic.trim() !== ""
            ? postObj.userId.profilePic
            : null,
        userId: postObj.userId?._id || null,
      };
    });

    res.status(200).json(formattedPosts);
  } catch (err) {
    console.error("Error fetching pending posts:", err);
    res.status(500).json({ error: err.message });
  }
};
