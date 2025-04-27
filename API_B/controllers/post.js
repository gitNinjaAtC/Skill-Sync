import { db } from "../connect.js";

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
      console.log("User not found for id:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    const userRole = results[0].role;
    console.log("addPost: User role:", userRole);

    // ✅ Only "Alumni" and "Admin" users can create a post
    if (userRole !== "Alumni" && userRole !== "Admin") {
      console.log("Access denied: User role not allowed to post:", userRole);
      return res
        .status(403)
        .json({ message: "Access denied: Only Alumni and Admins can post" });
    }

    // ✅ Validate post content
    const { desc } = req.body;
    if (!desc) {
      console.log("Post content missing for userId:", userId);
      return res.status(400).json({ message: "Post content is required" });
    }

    if (userRole === "Admin") {
      // ✅ Admin: Insert directly into posts with status "approved"
      const directPostQuery =
        "INSERT INTO posts (userId, `desc`, createdAt, status) VALUES (?, ?, NOW(), 'approved')";
      db.query(directPostQuery, [userId, desc], (err, result) => {
        if (err) {
          console.error("Error creating admin post:", err);
          return res
            .status(500)
            .json({ message: "Internal Server Error", error: err });
        }
        console.log("Admin post created, postId:", result.insertId);
        return res.status(201).json({
          success: true,
          message: "Post created successfully",
          postId: result.insertId,
        });
      });
    } else {
      // ✅ Alumni: Send to pending_posts for approval
      const adminApprovalQuery =
        "INSERT INTO pending_posts (userId, `desc`, createdAt) VALUES (?, ?, NOW())";
      db.query(adminApprovalQuery, [userId, desc], (err, result) => {
        if (err) {
          console.error("Error sending post for admin approval:", err);
          return res
            .status(500)
            .json({ message: "Internal Server Error", error: err });
        }
        console.log("Post created, pendingPostId:", result.insertId);
        return res.status(201).json({
          success: true,
          message: "Post sent for admin approval",
          pendingPostId: result.insertId,
        });
      });
    }
  });
};

// ADMIN APPROVAL

export const reviewPost = (req, res) => {
  console.log("🛑 Running reviewPost controller...");
  console.log("Request user:", req.user);

  if (!req.user || !req.user.id) {
    console.log("Error: User data missing from request");
    return res.status(400).json({ message: "User data missing from request" });
  }

  const userId = req.user.id;

  const roleQuery = "SELECT role FROM users WHERE id = ?";
  db.query(roleQuery, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching user role:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (results.length === 0) {
      console.log("Error: User not found, id:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    const userRole = results[0].role;
    console.log("User role:", userRole);
    if (userRole !== "Admin") {
      console.log("Access denied: User is not Admin, role:", userRole);
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    const { postId, action } = req.body;
    console.log("Review request: postId:", postId, "action:", action);
    if (!postId || !["approved", "declined"].includes(action)) {
      console.log("Invalid request: postId or action missing/invalid");
      return res.status(400).json({ message: "Invalid request" });
    }

    if (action === "approved") {
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

          console.log("Post approved, postId:", postId);
          return res.status(200).json({
            success: true,
            message: "Post approved and moved to live posts",
          });
        });
      });
    } else {
      const declineQuery = "DELETE FROM pending_posts WHERE id = ?";
      db.query(declineQuery, [postId], (err) => {
        if (err) {
          console.error("Error declining post:", err);
          return res.status(500).json({ message: "Internal Server Error" });
        }

        console.log("Post declined, postId:", postId);
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
