import { db } from "../connect.js";

// Like or Unlike a post
export const likePost = (req, res) => {
  const userId = req.user.id;
  const { postId } = req.body;

  if (!postId) {
    return res.status(400).json({ message: "Post ID is required" });
  }

  // Check if user already liked the post
  const checkQuery = "SELECT * FROM likes WHERE userId = ? AND postId = ?";
  db.query(checkQuery, [userId, postId], (err, data) => {
    if (err) return res.status(500).json(err);

    if (data.length > 0) {
      // User already liked → Unlike (DELETE)
      const deleteQuery = "DELETE FROM likes WHERE userId = ? AND postId = ?";
      db.query(deleteQuery, [userId, postId], (err) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json({ liked: false, message: "Post unliked" });
      });
    } else {
      // Not liked yet → Like (INSERT)
      const insertQuery = "INSERT INTO likes (userId, postId) VALUES (?, ?)";
      db.query(insertQuery, [userId, postId], (err) => {
        if (err) return res.status(500).json(err);
        return res.status(201).json({ liked: true, message: "Post liked" });
      });
    }
  });
};
