import { db } from "../connect.js";
import jwt from "jsonwebtoken";

// Get all the posts
export const getPosts = async (req, res) => {
  const q = `
        SELECT p.*, u.id AS userId, u.name, u.profilePic 
        FROM posts AS p 
        JOIN users AS u ON p.userId = u.id
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
  // ✅ Extract Bearer Token from Authorization Header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  // ✅ Get the token
  const token = authHeader.split(" ")[1];

  // ✅ Verify Token
  jwt.verify(token, process.env.JWT_SECRET, (err, userData) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden: Invalid token" });
    }

    // ✅ Extract user ID from token
    const userId = userData.id;

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
  });
};

//admin approval
export const reviewPost = (req, res) => {
  console.log("🛑 Running reviewPost middleware...");

  // ✅ Extract Token from Authorization Header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("❌ No Bearer token found. Rejecting request.");
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, userData) => {
    if (err) {
      console.log("❌ Invalid token:", err.message);
      return res.status(403).json({ message: "Forbidden: Invalid token" });
    }

    console.log("✅ Token valid. User authenticated:", userData);

    // ✅ Fetch user role from the database (DO NOT trust JWT alone)
    const roleQuery = "SELECT role FROM users WHERE id = ?";
    db.query(roleQuery, [userData.id], (err, results) => {
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
            return res
              .status(500)
              .json({ message: "Internal Server Error", error: err });
          }

          db.query(deleteQuery, [postId], (err) => {
            if (err) {
              console.error("Error removing from pending_posts:", err);
              return res
                .status(500)
                .json({ message: "Internal Server Error", error: err });
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
            return res
              .status(500)
              .json({ message: "Internal Server Error", error: err });
          }

          return res.status(200).json({
            success: true,
            message: "Post declined and removed",
          });
        });
      }
    });
  });
};

//DELETE POST

export const deletePost = (req, res) => {
  const postId = req.params.id;

  const q = "DELETE FROM posts WHERE id = ?";

  db.query(q, [postId], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.status(200).json({ message: "Post deleted successfully" });
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
