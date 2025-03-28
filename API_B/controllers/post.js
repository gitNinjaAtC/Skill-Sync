import { db } from "../connect.js";
import jwt from "jsonwebtoken";

// Get all the posts
export const getPosts = async (req, res) => {
  const q = `
    SELECT p.*, u.id AS userId, u.name, u.profilePic 
    FROM posts AS p 
    JOIN users AS u ON p.userId = u.id
    ORDER BY p.createdAt DESC
  `;

  db.query(q, (err, posts) => {
    if (err) {
      console.error("Database Query Error:", err.sqlMessage || err); // Log SQL error
      return res.status(500).json({ error: err.sqlMessage || err });
    }

    console.log("Fetched Posts:", posts); // Log fetched posts
    return res.status(200).json(posts);
  });
};

// ADD NEW POST
export const addPost = (req, res) => {
  // ✅ Extract user ID from validated middleware
  const userId = req.user.id;

  // ✅ Check User Role from Database
  const roleQuery = "SELECT role FROM users WHERE id = ?";
  db.query(roleQuery, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching user role:", err);
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const userRole = results[0].role;

    // ✅ Only "Alumni" users can create a post
    if (userRole !== "Alumni") {
      return res
        .status(403)
        .json({ message: "Access denied: Only Alumni can post" });
    }

    // ✅ Send request to admin for approval
    const { desc } = req.body;
    if (!desc) {
      return res.status(400).json({ message: "Post content is required" });
    }

    const adminApprovalQuery =
      "INSERT INTO pending_posts (userId, `desc`, createdAt) VALUES (?, ?, NOW())";

    db.query(adminApprovalQuery, [userId, desc], (err, result) => {
      if (err) {
        console.error("Error sending post for admin approval:", err);
        return res
          .status(500)
          .json({ message: "Internal Server Error", error: err });
      }

      return res.status(201).json({
        success: true,
        message: "Post sent for admin approval",
        pendingPostId: result.insertId,
      });
    });
  });
};

//admin approval
export const reviewPost = (req, res) => {
  console.log("🛑 Running reviewPost middleware...");

  // ✅ Ensure user data exists (handled by validateToken middleware)
  if (!req.user || !req.user.id) {
    return res.status(400).json({ message: "User data missing from request" });
  }

  const userId = req.user.id;

  // ✅ Fetch user role from the database (DO NOT trust JWT alone)
  const roleQuery = "SELECT role FROM users WHERE id = ?";
  db.query(roleQuery, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching user role:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const userRole = results[0].role;
    if (userRole !== "Admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    // ✅ Extract post review details
    const { postId, action } = req.body;
    if (!postId || !["approved", "declined"].includes(action)) {
      return res.status(400).json({ message: "Invalid request" });
    }

    if (action === "approved") {
      // ✅ Move post from `pending_posts` to `posts`
      const approveQuery = `
        INSERT INTO posts (userId, \`desc\`, createdAt, status)
        SELECT userId, \`desc\`, createdAt, 'approved' FROM pending_posts WHERE id = ?;
      `;
      const deleteQuery = "DELETE FROM pending_posts WHERE id = ?";

      db.query(approveQuery, [postId], (err) => {
        if (err) {
          console.error("Error approving post:", err);
          return res.status(500).json({ message: "Internal Server Error" });
        }

        db.query(deleteQuery, [postId], (err) => {
          if (err) {
            console.error("Error removing from pending_posts:", err);
            return res.status(500).json({ message: "Internal Server Error" });
          }

          return res.status(200).json({
            success: true,
            message: "Post approved and moved to live posts",
          });
        });
      });
    } else {
      // ✅ Delete post if declined
      const declineQuery = "DELETE FROM pending_posts WHERE id = ?";
      db.query(declineQuery, [postId], (err) => {
        if (err) {
          console.error("Error declining post:", err);
          return res.status(500).json({ message: "Internal Server Error" });
        }

        return res.status(200).json({
          success: true,
          message: "Post declined and removed",
        });
      });
    }
  });
};

//DELETE POST

export const deletePost = (req, res) => {
  console.log("🛑 Running deletePost middleware...");

  const { postId } = req.params;
  const userId = req.user.id; // Extracted from the token

  if (!postId) {
    return res.status(400).json({ message: "Post ID is required" });
  }

  console.log(
    `🗑️ Attempting to delete Post ID: ${postId} by User ID: ${userId}`
  );

  // ✅ Fetch the post details
  const postQuery = "SELECT userId FROM posts WHERE id = ?";
  db.query(postQuery, [postId], (err, postResults) => {
    if (err) {
      console.error("❌ Error fetching post details:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (postResults.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    const postOwnerId = Number(postResults[0].userId); // Ensure it's a number

    // ✅ Fetch the user role
    const roleQuery = "SELECT role FROM users WHERE id = ?";
    db.query(roleQuery, [userId], (err, userResults) => {
      if (err) {
        console.error("❌ Error fetching user role:", err);
        return res.status(500).json({ message: "Internal Server Error" });
      }

      if (userResults.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const userRole = userResults[0].role;
      console.log(`👤 User Role: ${userRole}, 🏠 Post Owner: ${postOwnerId}`);

      // ✅ Only Admins can delete any post
      if (userRole === "Admin") {
        console.log("✅ Admin deleting post...");
      }
      // ✅ Alumni can delete their own posts only
      else if (userRole === "Alumni" && postOwnerId === Number(userId)) {
        console.log("✅ Alumni deleting own post...");
      }
      // ❌ Access Denied for others
      else {
        console.log("🚫 Access denied: You cannot delete this post.");
        return res
          .status(403)
          .json({ message: "Access denied: You cannot delete this post" });
      }

      // ✅ Execute delete query if authorized
      const deleteQuery = "DELETE FROM posts WHERE id = ?";
      db.query(deleteQuery, [postId], (err) => {
        if (err) {
          console.error("❌ Error deleting post:", err);
          return res.status(500).json({ message: "Internal Server Error" });
        }

        console.log("✅ Post deleted successfully!");
        return res
          .status(200)
          .json({ success: true, message: "Post deleted successfully" });
      });
    });
  });
};

// export const deletePost = (req, res) => {
//   const postId = req.params.id; // Get post ID from URL
//   const token = req.cookies.accessToken; // Get token from cookies

//   if (!token) {
//     return res.status(401).json({ message: "Unauthorized: No token provided" });
//   }

//   // Verify JWT Token
//   jwt.verify(token, "secretKey", (err, userInfo) => {
//     if (err) {
//       return res.status(403).json({ message: "Forbidden: Invalid token" });
//     }

//     // Get the owner of the post
//     const checkOwnerQuery = "SELECT userId FROM posts WHERE id = ?";
//     db.query(checkOwnerQuery, [postId], (err, data) => {
//       if (err) return res.status(500).json(err);
//       if (data.length === 0)
//         return res.status(404).json({ message: "Post not found" });

//       // Compare logged-in user ID with post owner's ID
//       if (data[0].userId !== userInfo.id) {
//         return res
//           .status(403)
//           .json({ message: "You can only delete your own posts" });
//       }

//       // Delete the post if the user is the owner
//       const deleteQuery = "DELETE FROM posts WHERE id = ?";
//       db.query(deleteQuery, [postId], (err, result) => {
//         if (err) return res.status(500).json(err);
//         return res.status(200).json({ message: "Post deleted successfully" });
//       });
//     });
//   });
// };
