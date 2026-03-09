import Project from "../models/Project.js";
import Application from "../models/Application.js";
import ProjectUpdate from "../models/ProjectUpdate.js";

// ── Projects ──────────────────────────────────────────────────────────────────

export const getAllProjects = async (req, res) => {
  try {
    const { tech, status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (tech) filter.techStack = { $in: [new RegExp(tech, "i")] };

    const projects = await Project.find(filter)
      .populate("postedBy", "name email profilePic role")
      .sort({ createdAt: -1 })
      .lean();

    // For each project attach accepted count so frontend knows slots remaining
    const projectIds = projects.map((p) => p._id);
    const acceptedCounts = await Application.aggregate([
      { $match: { projectId: { $in: projectIds }, status: "accepted" } },
      { $group: { _id: "$projectId", count: { $sum: 1 } } },
    ]);

    const countMap = new Map(acceptedCounts.map((a) => [String(a._id), a.count]));

    const enriched = projects.map((p) => ({
      ...p,
      acceptedCount: countMap.get(String(p._id)) || 0,
      slotsRemaining: p.slots - (countMap.get(String(p._id)) || 0),
    }));

    res.status(200).json(enriched);
  } catch (err) {
    console.error("getAllProjects error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("postedBy", "name email profilePic role")
      .lean();

    if (!project) return res.status(404).json({ message: "Project not found" });

    const acceptedCount = await Application.countDocuments({
      projectId: project._id,
      status: "accepted",
    });

    res.status(200).json({
      ...project,
      acceptedCount,
      slotsRemaining: project.slots - acceptedCount,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const createProject = async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== "alumni" && role !== "faculty") {
      return res.status(403).json({ message: "Only alumni or faculty can post projects" });
    }

    const { title, description, techStack, slots, deadline } = req.body;
    if (!title || !description || !slots || !deadline) {
      return res.status(400).json({ message: "title, description, slots and deadline are required" });
    }

    const project = await Project.create({
      title,
      description,
      techStack: Array.isArray(techStack) ? techStack : [],
      slots,
      deadline,
      postedBy: req.user._id,
    });

    const populated = await project.populate("postedBy", "name email profilePic role");
    res.status(201).json(populated);
  } catch (err) {
    console.error("createProject error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProjectStatus = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (String(project.postedBy) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { status } = req.body;
    if (!["open", "in-progress", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    project.status = status;
    await project.save();
    res.status(200).json(project);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (String(project.postedBy) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Project.findByIdAndDelete(req.params.id);
    await Application.deleteMany({ projectId: req.params.id });
    await ProjectUpdate.deleteMany({ projectId: req.params.id });

    res.status(200).json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ── Applications ──────────────────────────────────────────────────────────────

export const applyToProject = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can apply" });
    }

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.status !== "open") {
      return res.status(400).json({ message: "Project is not open for applications" });
    }

    const acceptedCount = await Application.countDocuments({
      projectId: project._id,
      status: "accepted",
    });
    if (acceptedCount >= project.slots) {
      return res.status(400).json({ message: "All slots are filled" });
    }

    const existing = await Application.findOne({
      projectId: project._id,
      studentId: req.user._id,
    });
    if (existing) {
      return res.status(400).json({ message: "You have already applied" });
    }

    const application = await Application.create({
      projectId: project._id,
      studentId: req.user._id,
      note: req.body.note || "",
    });

    res.status(201).json(application);
  } catch (err) {
    console.error("applyToProject error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ studentId: req.user._id })
      .populate({
        path: "projectId",
        populate: { path: "postedBy", select: "name profilePic" },
      })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getProjectApplications = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (String(project.postedBy) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const applications = await Application.find({ projectId: req.params.id })
      .populate("studentId", "name email profilePic skills about")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const application = await Application.findById(req.params.appId).populate("projectId");
    if (!application) return res.status(404).json({ message: "Application not found" });

    if (String(application.projectId.postedBy) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // If accepting, check slots haven't already been filled
    if (status === "accepted") {
      const acceptedCount = await Application.countDocuments({
        projectId: application.projectId._id,
        status: "accepted",
      });
      if (acceptedCount >= application.projectId.slots) {
        return res.status(400).json({ message: "All slots are already filled" });
      }
    }

    application.status = status;
    await application.save();
    res.status(200).json(application);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ── Project Updates (feed) ────────────────────────────────────────────────────

export const getProjectUpdates = async (req, res) => {
  try {
    const updates = await ProjectUpdate.find({ projectId: req.params.id })
      .populate("postedBy", "name profilePic")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(updates);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const postProjectUpdate = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (String(project.postedBy) !== String(req.user._id)) {
      return res.status(403).json({ message: "Only the project owner can post updates" });
    }

    const { content } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ message: "Update content is required" });
    }

    const update = await ProjectUpdate.create({
      projectId: project._id,
      postedBy: req.user._id,
      content: content.trim(),
    });

    const populated = await update.populate("postedBy", "name profilePic");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};