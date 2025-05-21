import { db } from "../connect.js";

// Create a new forum (Admin and Alumni only)
export const createForum = (req, res) => {
  console.log("🛑 Running createForum controller...");
  console.log("Request user:", req.user);

  // Ensure user is authenticated
  if (!req.user || !req.user.id) {
    console.log("Error: User data missing from request");
    return res.status(400).json({ message: "User data missing from request" });
  }

  const userId = req.user.id;

  // Fetch user role
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

    // Restrict to Admin and Alumni
    if (!["Admin", "Alumni"].includes(userRole)) {
      console.log(
        "Access denied: User is not Admin or Alumni, role:",
        userRole
      );
      return res
        .status(403)
        .json({ message: "Access denied: Admin or Alumni only" });
    }

    // Extract and validate forum details
    const { title, description, tags } = req.body;
    if (!title || !description) {
      console.log("Invalid request: title and description are required");
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }

    // Tags are optional; convert to comma-separated string if array
    const tagsString = Array.isArray(tags) ? tags.join(",") : tags || null;

    // Insert forum into database
    const insertQuery = `
      INSERT INTO forums (title, description, tags, created_by)
      VALUES (?, ?, ?, ?)
    `;
    const values = [title, description, tagsString, userId];

    db.query(insertQuery, values, (err, result) => {
      if (err) {
        console.error("Error creating forum:", err);
        return res.status(500).json({ message: "Internal Server Error" });
      }

      console.log("Forum created, id:", result.insertId);
      return res.status(201).json({
        success: true,
        message: "Forum created successfully",
        forumId: result.insertId,
      });
    });
  });
};

// Get all forums
export const getForums = (req, res) => {
  console.log("🛑 Running getForums controller...");

  const query = `
    SELECT f.id, f.title, f.description, f.tags, f.created_at, u.name AS created_by_name
    FROM forums f
    JOIN users u ON f.created_by = u.id
    ORDER BY f.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching forums:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    // Parse tags from comma-separated string to array
    const forums = results.map((forum) => ({
      ...forum,
      tags: forum.tags ? forum.tags.split(",") : [],
      createdAgo: calculateTimeAgo(forum.created_at),
    }));

    console.log("Fetched forums:", forums.length);
    return res.status(200).json(forums);
  });
};

// Delete a forum (only by creator)
export const deleteForum = (req, res) => {
  console.log("🛑 Running deleteForum controller...");
  console.log("Request user:", req.user);

  if (!req.user || !req.user.id) {
    console.log("Error: User data missing from request");
    return res.status(400).json({ message: "User data missing from request" });
  }

  const userId = req.user.id;
  const forumId = req.params.id;

  // Check if forum exists and user is the creator
  const checkQuery = "SELECT created_by FROM forums WHERE id = ?";
  db.query(checkQuery, [forumId], (err, results) => {
    if (err) {
      console.error("Error checking forum:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (results.length === 0) {
      console.log("Error: Forum not found, id:", forumId);
      return res.status(404).json({ message: "Forum not found" });
    }

    if (results[0].created_by !== userId) {
      console.log("Access denied: User is not the creator, userId:", userId);
      return res
        .status(403)
        .json({
          message: "Access denied: Only the creator can delete this forum",
        });
    }

    // Delete the forum
    const deleteQuery = "DELETE FROM forums WHERE id = ?";
    db.query(deleteQuery, [forumId], (err, result) => {
      if (err) {
        console.error("Error deleting forum:", err);
        return res.status(500).json({ message: "Internal Server Error" });
      }

      if (result.affectedRows === 0) {
        console.log("Error: Forum not found or already deleted, id:", forumId);
        return res.status(404).json({ message: "Forum not found" });
      }

      console.log("Forum deleted, id:", forumId);
      return res
        .status(200)
        .json({ success: true, message: "Forum deleted successfully" });
    });
  });
};

// Helper to calculate "time ago"
const calculateTimeAgo = (createdAt) => {
  const now = new Date(); // Use current date dynamically
  const createdDate = new Date(createdAt);
  const diffMs = now - createdDate; // Difference in milliseconds
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffMonths / 12);

  // Handle future dates or zero difference
  if (diffMs < 0) return "Just now"; // If created_at is in the future
  if (diffDays === 0) return "Today";
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  if (diffMonths < 12)
    return `${diffMonths} month${diffMonths !== 1 ? "s" : ""} ago`;
  return `${diffYears} year${diffYears !== 1 ? "s" : ""} ago`;
};
