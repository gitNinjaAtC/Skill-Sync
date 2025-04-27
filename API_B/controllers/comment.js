import { db } from "../connect.js";

// GET comments for a specific post
export const getComments = (req, res) => {
  const postId = req.params.postId;

  const q = `
    SELECT c.*, u.name, u.profilePic
    FROM comments AS c
    JOIN users AS u ON c.userId = u.id
    WHERE c.postId = ?
    ORDER BY c.createdAt DESC
  `;

  db.query(q, [postId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

// ADD a new comment
export const addComment = (req, res) => {
  const userId = req.user.id;
  const { postId, comment } = req.body;

  if (!postId || !comment) {
    return res
      .status(400)
      .json({ message: "Post ID and comment are required" });
  }

  const q = `
    INSERT INTO comments (postId, userId, comment)
    VALUES (?, ?, ?)
  `;

  db.query(q, [postId, userId, comment], (err, result) => {
    if (err) return res.status(500).json(err);
    return res.status(201).json({ success: true, commentId: result.insertId });
  });
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
