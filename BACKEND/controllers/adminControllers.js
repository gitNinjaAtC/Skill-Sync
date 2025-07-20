import User from "../models/Users.js";
import mongoose from "mongoose";
import csv from "csv-parser";
import xlsx from "xlsx";
import fs from "fs";
import bcrypt from "bcrypt";
import Student from "../models/Student.js";

// Admin approval route
export const approveUser = async (req, res) => {
  console.log("Approve user route hit, body:", req.body);
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admins can approve users" });
    }

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isActive) {
      return res.status(400).json({ error: "User is already approved" });
    }

    user.isActive = true;
    await user.save();

    const updatedUser = await User.findById(userId).lean();
    console.log("✅ User approved:", updatedUser);
    return res
      .status(200)
      .json({ message: "User approved successfully", user: updatedUser });
  } catch (err) {
    console.error("❌ Approval error:", err);
    if (err.code === "ECONNRESET") {
      return res.status(500).json({
        error:
          "Database connection error: Connection reset. Please try again later.",
      });
    }
    return res.status(500).json({ error: err.message });
  }
};

//get all users
export const getUsers = async (req, res) => {
  try {
    const { active, role } = req.query;
    const filter = {};

    if (active === "true") filter.isActive = true;
    else if (active === "false") filter.isActive = false;

    if (role) filter.role = role;

    const users = await User.find(filter).select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
};

// Create admin 
export const createAdmin = async (req, res) => {
  try {
    const { username, name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new User({
      username,
      name,
      email,
      password: hashedPassword,
      role: "admin",     // ✅ Important: mark this user as admin
      isActive: true     // ✅ Optional: you can control admin approval
    });

    await newAdmin.save();
    res.status(201).json({ message: "Admin created successfully", user: newAdmin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while creating admin" });
  }
};


//import file
export const importFile = async (req, res) => {
try {
console.log("Received request to /API_B/admin/upload");
if (!req.file) {
return res.status(400).json({ error: "No file uploaded" });
}
const batch = req.body.batch; // Get batch from form-data
const branch = req.body.branch; // ✅ Get branch from form-data
if (batch && !/^\d{4}-\d{4}$/.test(batch)) {
return res
.status(400)
.json({ error: "Batch must be in the format YYYY-YYYY" });
}
const filePath = req.file.path;
let students = [];
let duplicateRows = [];
let invalidRows = [];
const cleanMobileNo = (mobile) => {
if (!mobile) return "0000000000";
const cleaned = String(mobile).replace(/[^0-9]/g, "");
return cleaned.length === 10 ? cleaned : "0000000000";
};
const parseDate = (date) => {
if (!date) return null;
const dateStr = String(date);
const ddmmyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
if (ddmmyyyy) {
const [_, day, month, year] = ddmmyyyy;
const parsed = new Date(
`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
);
if (!isNaN(parsed)) return parsed;
}
const parsed = new Date(dateStr);
if (!isNaN(parsed)) return parsed;
if (!isNaN(date)) {
const excelDate = new Date((Number(date) - 25569) * 86400 * 1000);
if (!isNaN(excelDate)) return excelDate;
}
return null;
};
const normalizeGender = (gender) => {
if (!gender) return "Other";
const g = String(gender).toLowerCase().trim();
if (g === "male" || g === "m") return "Male";
if (g === "female" || g === "f") return "Female";
if (g === "other" || g === "o") return "Other";
return "Other";
};
const validateStudent = (student) => {
const errors = [];
if (!student.EnrollmentNo || student.EnrollmentNo === "unknown")
errors.push("Missing or invalid EnrollmentNo");
if (!student.StudentName || student.StudentName === "Unknown")
errors.push("Missing or invalid StudentName");
if (!student.RegistrationNo || student.RegistrationNo === "unknown")
errors.push("Missing or invalid RegistrationNo");
if (!student.ClassRollNo || student.ClassRollNo === "unknown")
errors.push("Missing or invalid ClassRollNo");
if (
!student.EmailId ||
student.EmailId === "unknown" ||
!/^\S+@\S+\.\S+$/.test(student.EmailId)
) {
errors.push("Missing or invalid EmailId");
}
if (
!student.MobileNo ||
student.MobileNo === "0000000000" ||
!/^\d{10}$/.test(student.MobileNo)
) {
errors.push("Missing or invalid MobileNo");
}
if (!student.DateOfBirth || isNaN(student.DateOfBirth))
errors.push("Missing or invalid DateOfBirth");
if (
!student.GenderName ||
!["Male", "Female", "Other"].includes(student.GenderName)
) {
errors.push("Missing or invalid GenderName");
}
if (student.batch && !/^\d{4}-\d{4}$/.test(student.batch))
errors.push("Invalid batch format");
return errors;
};
const checkDuplicates = async (student) => {
const errors = [];
if (student.EmailId && student.EmailId !== "unknown") {
const existingEmail = await Student.findOne({
EmailId: student.EmailId,
});
if (existingEmail) errors.push("Duplicate EmailId");
}
if (student.EnrollmentNo && student.EnrollmentNo !== "unknown") {
const existingEnrollment = await Student.findOne({
EnrollmentNo: student.EnrollmentNo,
});
if (existingEnrollment) errors.push("Duplicate EnrollmentNo");
}
if (student.RegistrationNo && student.RegistrationNo !== "unknown") {
const existingRegistration = await Student.findOne({
RegistrationNo: student.RegistrationNo,
});
if (existingRegistration) errors.push("Duplicate RegistrationNo");
}
return errors;
};
if (req.file.mimetype === "text/csv") {
fs.createReadStream(filePath)
.pipe(csv())
.on("data", (row) => {
const student = {
EnrollmentNo: row.EnrollmentNo
? String(row.EnrollmentNo).trim()
: "unknown",
StudentName: row.StudentName
? String(row.StudentName).trim()
: "Unknown",
RegistrationNo: row.RegistrationNo
? String(row.RegistrationNo).trim()
: "unknown",
ClassRollNo: row.ClassRollNo
? String(row.ClassRollNo).trim()
: "unknown",
EmailId: row.EmailId
? String(row.EmailId).trim().toLowerCase()
: `unknown_${students.length}_${Date.now()}`,
MobileNo: cleanMobileNo(row.MobileNo),
DateOfBirth: parseDate(row.DateOfBirth),
GenderName: normalizeGender(row.GenderName),
batch: batch || undefined,
branch: branch || undefined, // ✅ branch added
};
students.push(student);
})
.on("end", async () => {
if (students.length === 0) {
fs.unlinkSync(filePath);
return res.status(400).json({
error: "No valid data found in CSV file",
duplicateRows,
invalidRows,
});
}
const savedStudents = [];
for (const [index, student] of students.entries()) {
const validationErrors = await validateStudent(student);
const duplicateErrors = await checkDuplicates(student);
try {
const saved = await Student.create(student);
savedStudents.push(saved);
if (validationErrors.length > 0) {
invalidRows.push({
row: student,
rowIndex: index + 2,
reason: validationErrors.join(", "),
});
}
if (duplicateErrors.length > 0) {
duplicateRows.push({
row: student,
rowIndex: index + 2,
reason: duplicateErrors.join(", "),
});
}
} catch (error) {
invalidRows.push({
row: student,
rowIndex: index + 2,
reason: error.message,
});
}
}
fs.unlinkSync(filePath);
res.status(200).json({
message: "Data imported successfully",
count: savedStudents.length,
duplicateRows,
invalidRows,
});
})
.on("error", (error) => {
res
.status(500)
.json({ error: `Error processing CSV file: ${error.message}` });
});
} else {
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
students = xlsx.utils.sheet_to_json(sheet);
students = students.map((row, index) => ({
EnrollmentNo: row.EnrollmentNo
? String(row.EnrollmentNo).trim()
: "unknown",
StudentName: row.StudentName
? String(row.StudentName).trim()
: "Unknown",
RegistrationNo: row.RegistrationNo
? String(row.RegistrationNo).trim()
: "unknown",
ClassRollNo: row.ClassRollNo
? String(row.ClassRollNo).trim()
: "unknown",
EmailId: row.EmailId
? String(row.EmailId).trim().toLowerCase()
: `unknown_${index}_${Date.now()}`,
MobileNo: cleanMobileNo(row.MobileNo),
DateOfBirth: parseDate(row.DateOfBirth),
GenderName: normalizeGender(row.GenderName),
batch: batch || undefined,
branch: branch || undefined, // ✅ branch added
}));
if (students.length === 0) {
fs.unlinkSync(filePath);
return res.status(400).json({
error: "No valid data found in Excel file",
duplicateRows,
invalidRows,
});
}
const savedStudents = [];
for (const [index, student] of students.entries()) {
const validationErrors = await validateStudent(student);
const duplicateErrors = await checkDuplicates(student);
try {
const saved = await Student.create(student);
savedStudents.push(saved);
if (validationErrors.length > 0) {
invalidRows.push({
row: student,
rowIndex: index + 2,
reason: validationErrors.join(", "),
});
}
if (duplicateErrors.length > 0) {
duplicateRows.push({
row: student,
rowIndex: index + 2,
reason: duplicateErrors.join(", "),
});
}
} catch (error) {
invalidRows.push({
row: student,
rowIndex: index + 2,
reason: error.message,
});
}
}
fs.unlinkSync(filePath);
res.status(200).json({
message: "Data imported successfully",
count: savedStudents.length,
duplicateRows,
invalidRows,
});
}
} catch (error) {
res.status(500).json({
error: `Server error during file processing: ${error.message}`,
});
}
};