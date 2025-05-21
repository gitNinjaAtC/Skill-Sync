import db from "../connect.js";

// Add a like
export const addLike = (req, res) => {
  const userId = req.user.id;
  const postId = req.body.postId;

  const q = "INSERT INTO likes (userId, postId) VALUES (?, ?)";

  db.query(q, [userId, postId], (err, result) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json("Post liked.");
  });
};

// Remove a like
export const removeLike = (req, res) => {
  const userId = req.user.id;
  const postId = req.params.postId;

  const q = "DELETE FROM likes WHERE userId = ? AND postId = ?";

  db.query(q, [userId, postId], (err, result) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json("Post unliked.");
  });
};

// Get all users who liked a post
export const getLikes = (req, res) => {
  const postId = req.params.postId;

  const q = `
    SELECT users.id, users.name
    FROM likes
    JOIN users ON likes.userId = users.id
    WHERE likes.postId = ?
  `;

  db.query(q, [postId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};
