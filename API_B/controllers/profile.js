// import { db } from "../connect.js";

// // Get user profile details by ID
// export const getProfile = (req, res) => {
//   const userId = req.params.id;

//   const q = `
//     SELECT 
//       id, name, profilePic, coverImage, location, language,
//       facebook, instagram, twitter, linkedin, email, created_at
//     FROM users
//     WHERE id = ?
//   `;

//   db.query(q, [userId], (err, data) => {
//     if (err) {
//       console.error("Error fetching profile:", err);
//       return res.status(500).json({ message: "Server error", error: err });
//     }

//     if (data.length === 0) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     return res.status(200).json(data[0]);
//   });
// };
