import AlumniUpdate from "../models/AlumniUpdate.js";
import Student from "../models/Student.js";

// Search students by name for the dropdown
export const searchStudents = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ message: "Name query parameter is required" });
    }

    // Normalize spaces in search name to handle multiple spaces in DB
    const normalizedName = name.trim().split(/\s+/).join('\\s+');

    const students = await Student.find({
      StudentName: { $regex: normalizedName, $options: "i" },
    }).lean();

    // Filter students to only include alumni based on batch
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0 is January, 6 is July

    const alumniOnly = students.filter(student => {
      if (!student.batch) return false;
      const batchParts = student.batch.split('-');
      if (batchParts.length !== 2) return false;
      
      const endYear = parseInt(batchParts[1]);
      
      // If passing year is in the past, they are alumni
      if (endYear < currentYear) return true;
      
      // If passing year is current year, they are alumni if current month > July (6)
      if (endYear === currentYear && currentMonth > 6) return true;
      
      return false;
    });

    res.status(200).json(alumniOnly.slice(0, 10));
  } catch (error) {
    console.error("Error searching students:", error);
    res.status(500).json({ message: "Error searching students" });
  }
};

// Create a new alumni note
export const upsertAlumniUpdate = async (req, res) => {
  try {
    const { studentId, note, isVisible, category } = req.body;
    const adminId = req.user?.id; // Assuming admin ID is available in req.user from token validation

    if (!studentId || !note) {
      return res.status(400).json({ message: "StudentId and note are required" });
    }

    const newUpdate = new AlumniUpdate({
      studentId,
      note,
      category: category || "Update",
      isVisible: isVisible !== undefined ? isVisible : true,
      adminId,
    });

    await newUpdate.save();
    
    const populatedUpdate = await AlumniUpdate.findById(newUpdate._id).populate("studentId", "StudentName batch branch");

    res.status(201).json({ message: "Alumni update created successfully", data: populatedUpdate });
  } catch (error) {
    console.error("Error creating alumni update:", error);
    res.status(500).json({ message: "Error creating alumni update" });
  }
};

// Update an existing alumni note
export const updateAlumniUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { note, category, isVisible } = req.body;

    if (!note || !note.trim()) {
      return res.status(400).json({ message: "Note is required" });
    }

    const updatedFields = {
      ...(note !== undefined && { note: note.trim() }),
      ...(category !== undefined && { category }),
      ...(isVisible !== undefined && { isVisible }),
    };

    const updated = await AlumniUpdate.findByIdAndUpdate(
      id,
      { $set: updatedFields },
      { new: true }
    ).populate("studentId", "StudentName batch branch");

    if (!updated) {
      return res.status(404).json({ message: "Update not found" });
    }

    res.status(200).json({ message: "Alumni update modified successfully", data: updated });
  } catch (error) {
    console.error("Error updating alumni update:", error);
    res.status(500).json({ message: "Error updating alumni update" });
  }
};

// Fetch all alumni updates for admin
export const getAllAlumniUpdates = async (req, res) => {
  try {
    const updates = await AlumniUpdate.find()
      .populate("studentId", "StudentName batch branch")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(updates);
  } catch (error) {
    console.error("Error fetching alumni updates:", error);
    res.status(500).json({ message: "Error fetching alumni updates" });
  }
};

// Fetch visible alumni updates for frontend
export const getVisibleAlumniUpdates = async (req, res) => {
  try {
    const updates = await AlumniUpdate.find({ isVisible: true })
      .populate("studentId", "StudentName batch branch")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(updates);
  } catch (error) {
    console.error("Error fetching visible alumni updates:", error);
    res.status(500).json({ message: "Error fetching visible alumni updates" });
  }
};

// Delete an alumni update
export const deleteAlumniUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await AlumniUpdate.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Update not found" });
    }

    res.status(200).json({ message: "Alumni update deleted successfully" });
  } catch (error) {
    console.error("Error deleting alumni update:", error);
    res.status(500).json({ message: "Error deleting alumni update" });
  }
};