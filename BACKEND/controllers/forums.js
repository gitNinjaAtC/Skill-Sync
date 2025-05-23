// controllers/forum.js
import Forum from "../models/Forum.js";

// Get all forums
export const getForums = async (req, res) => {
  try {
    const forums = await Forum.find()
      .sort({ created_at: -1 })
      .populate("created_by", "name");
    res.status(200).json(forums);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a specific forum by ID
export const getForumById = async (req, res) => {
  try {
    const forum = await Forum.findById(req.params.id).populate(
      "created_by",
      "name"
    );
    if (!forum) return res.status(404).json({ message: "Forum not found" });
    res.status(200).json(forum);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new forum
export const createForum = async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    const created_by = req.user.id; // assuming auth middleware sets req.user

    const newForum = new Forum({
      title,
      description,
      tags,
      created_by,
    });

    await newForum.save();
    res.status(201).json(newForum);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a forum
export const deleteForum = async (req, res) => {
  try {
    const forum = await Forum.findById(req.params.id);
    if (!forum) return res.status(404).json({ message: "Forum not found" });

    // Optional: Check ownership
    if (forum.created_by.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Forum.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Forum deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
