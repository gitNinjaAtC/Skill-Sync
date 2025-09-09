import AlumniForm from "../models/AlumniForm.js";
import User from "../models/User.js";
import Student from "../models/Student.js";

// ✅ Get form data (only for alumnus)
export const getAlumniForm = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if user is an alumnus
    const user = await User.findById(userId);
    if (!user || user.role !== "alumni") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Fetch student info using email
    const student = await Student.findOne({ EmailId: user.email });

    // Fetch previously submitted form if exists
    const form = await AlumniForm.findOne({ userId });

    res.status(200).json({
      // Always prefill personal info from Student table
      name: student?.StudentName || user.name || "Unknown",
      email: student?.EmailId || user.email || "Unknown",
      batch: student?.batch || "N/A",
      department: student?.branch || "N/A",

      // Form fields from AlumniForm if exists
      form: form || null
    });
  } catch (error) {
    console.error("❌ Error fetching alumni form data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Submit the form
export const submitAlumniForm = async (req, res) => {
  try {
    const userId = req.user._id;
    const { attending, phoneNumber, occupation, city, specialRequirements, accommodation } = req.body;

    const user = await User.findById(userId);
    if (!user || user.role !== "alumni") {
      return res.status(403).json({ message: "Access denied" });
    }

    const existingForm = await AlumniForm.findOne({ userId });
    if (existingForm) {
      return res.status(400).json({ message: "Form already submitted" });
    }

    const form = new AlumniForm({
      userId,
      attending,
      phoneNumber,
      occupation,
      city,
      specialRequirements,
      accommodation
    });

    await form.save();
    res.status(201).json({ message: "Form submitted successfully" });
  } catch (error) {
    console.error("❌ Error submitting alumni form:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
