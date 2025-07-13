// import express from "express";
// import User from "../models/User.js"; 
// const router = express.Router();

// // GET /API_B/people - fetch all users
// router.get("/", async (req, res) => {
//   try {
//     const users = await User.find({}, { password: 0 }); // exclude password
//     res.status(200).json(users);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch users" });
//   }
// });

// export default router;