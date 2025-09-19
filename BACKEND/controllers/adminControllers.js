import User from "../models/Users.js";
import mongoose from "mongoose";
import csv from "csv-parser";
import xlsx from "xlsx";
import fs from "fs";
import bcrypt from "bcrypt";
import Student from "../models/Student.js";
import AlumniForm from "../models/AlumniForm.js";

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
      role: "admin", // ✅ Important: mark this user as admin
      isActive: true, // ✅ Optional: you can control admin approval
    });

    await newAdmin.save();
    res
      .status(201)
      .json({ message: "Admin created successfully", user: newAdmin });
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
    const branch = req.body.branch; // Get branch from form-data
    const role = req.body.role || "student"; // Get role from form-data, default to "student"
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
    const validateStudent = (student) => {
      const errors = [];
      if (!student.EnrollmentNo || student.EnrollmentNo === "unknown")
        errors.push("Missing or invalid EnrollmentNo");
      if (!student.StudentName || student.StudentName === "unknown")
        errors.push("Missing or invalid StudentName");
      // if (
      //   !student.EmailId ||
      //   student.EmailId === "unknown" ||
      //   !/^\S+@\S+\.\S+$/.test(student.EmailId)
      // ) {
      //   errors.push("Missing or invalid EmailId");
      // }
      // if (
      //   !student.MobileNo ||
      //   student.MobileNo === "0000000000" ||
      //   !/^\d{10}$/.test(student.MobileNo)
      // ) {
      //   errors.push("Missing or invalid MobileNo");
      // }
      return errors;
    };
    const checkDuplicates = async (student) => {
      const errors = [];
      if (student.EnrollmentNo && student.EnrollmentNo !== "unknown") {
        const existingEnrollment = await Student.findOne({
          EnrollmentNo: student.EnrollmentNo,
        });
        if (existingEnrollment) errors.push("Duplicate EnrollmentNo");
      }
      return errors;
    };
    const buildStudentObject = (row, index) => {
      const student = {
        EnrollmentNo: row.EnrollmentNo
          ? String(row.EnrollmentNo).trim()
          : "unknown",
        StudentName: row.StudentName
          ? String(row.StudentName).trim()
          : "unknown",
        EmailId: row.EmailId
          ? String(row.EmailId).trim().toLowerCase()
          : `unknown_${index}_${Date.now()}`,
        MobileNo: cleanMobileNo(row.MobileNo),
        role: role, // Add role with default "student"
      };
      if (batch) student.batch = batch;
      if (branch) student.branch = branch;
      return student;
    };
    if (req.file.mimetype === "text/csv") {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
          const student = buildStudentObject(row, students.length);
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
            if (validationErrors.length === 0) {
              try {
                const saved = await Student.create(student);
                savedStudents.push(saved);
              } catch (error) {
                let reason = error.message;
                if (error.code === 11000) {
                  reason = `Duplicate key error: ${JSON.stringify(
                    error.keyValue
                  )}`;
                }
                invalidRows.push({
                  row: student,
                  rowIndex: index + 2,
                  reason,
                });
              }
            } else {
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
      students = students.map((row, index) => buildStudentObject(row, index));
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
        if (validationErrors.length === 0) {
          try {
            const saved = await Student.create(student);
            savedStudents.push(saved);
          } catch (error) {
            let reason = error.message;
            if (error.code === 11000) {
              reason = `Duplicate key error: ${JSON.stringify(error.keyValue)}`;
            }
            invalidRows.push({
              row: student,
              rowIndex: index + 2,
              reason,
            });
          }
        } else {
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
// Get students by batch and branch
export const getStudents = async (req, res) => {
  try {
    const { batch, branch } = req.query;

    if (!batch || !branch) {
      return res.status(400).json({ error: "Batch and Branch are required" });
    }

    const students = await Student.find({ batch, branch }).lean();

    // Always return 200 with an array (even if empty)
    return res.status(200).json(students);
  } catch (err) {
    console.error("❌ Error fetching students:", err);
    return res
      .status(500)
      .json({ error: "Server error while fetching students" });
  }
};

// // Debug version of getAllAlumniForms
// import AlumniForm from "../models/AlumniForm.js";
// import Student from "../models/Student.js";

export const getAllAlumniForms = async (req, res) => {
  try {
    console.log("🎯 getAllAlumniForms endpoint called");
    console.log("👤 User role:", req.user?.role);

    // Check if the user is an admin
    if (req.user.role !== "admin") {
      console.log("⛔ Access denied - not admin");
      return res.status(403).json({ message: "Access denied" });
    }

    console.log("✅ Admin access confirmed, fetching data...");

    // Fetch all alumni forms and populate user info
    const forms = await AlumniForm.find()
      .populate("userId", "name email")
      .lean();
    console.log(`📋 Found ${forms.length} alumni forms`);

    if (forms.length > 0) {
      console.log("🔍 First form sample:", {
        id: forms[0]._id,
        userId: forms[0].userId,
        attending: forms[0].attending,
      });
    }

    // Fetch all students data for batch/branch lookup
    const students = await Student.find(
      {},
      "EmailId StudentName batch branch"
    ).lean();
    console.log(`👥 Found ${students.length} student records`);

    if (students.length > 0) {
      console.log(
        "🔍 Student samples:",
        students.slice(0, 3).map((s) => ({
          email: s.EmailId,
          name: s.StudentName,
          batch: s.batch,
          branch: s.branch,
        }))
      );
    }

    // Create a map of email to student data for faster lookup
    const studentMap = new Map();
    students.forEach((student) => {
      if (student.EmailId) {
        const normalizedEmail = student.EmailId.toLowerCase().trim();
        studentMap.set(normalizedEmail, {
          batch: student.batch || "N/A",
          branch: student.branch || "N/A",
        });
      }
    });

    console.log(`🗺️ Created student map with ${studentMap.size} entries`);

    // Enrich forms with batch and branch data
    const enrichedForms = forms.map((form, index) => {
      const userEmail = form.userId?.email?.toLowerCase()?.trim();
      const studentData = studentMap.get(userEmail) || {
        batch: "N/A",
        branch: "N/A",
      };

      console.log(`🔍 Form ${index + 1} enrichment:`, {
        userEmail,
        foundMatch: studentMap.has(userEmail),
        batch: studentData.batch,
        branch: studentData.branch,
      });

      return {
        ...form,
        batch: studentData.batch,
        branch: studentData.branch,
      };
    });

    console.log(`✅ Successfully enriched ${enrichedForms.length} forms`);

    const successfulMatches = enrichedForms.filter(
      (form) => form.batch !== "N/A" || form.branch !== "N/A"
    ).length;

    console.log(
      `📊 Successful matches: ${successfulMatches}/${enrichedForms.length}`
    );

    res.status(200).json(enrichedForms);
  } catch (error) {
    console.error("❌ Error in getAllAlumniForms:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
