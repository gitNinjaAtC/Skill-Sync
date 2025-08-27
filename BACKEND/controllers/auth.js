import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/Users.js";
import Student from "../models/Student.js";
import cloudinary from "../lib/cloudinary.js";
import { sendResetEmail, sendRecoveryEmail } from "../lib/sendEmail.js";

// ✅ REGISTER
export const register = async (req, res) => {
  console.log("Register route hit, body:", req.body);
  try {
    const { email, password, name, role, enrollmentNo } = req.body;

    // Prevent admin registration
    if (role === "admin") {
      return res.status(403).json("Admin registration is not allowed");
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json("User already exists");

    // Hash the password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Handle Faculty registration
    if (role === "faculty") {
      if (enrollmentNo) {
        return res
          .status(400)
          .json("Enrollment number is not required for faculty registration");
      }
      const newUser = new User({
        email,
        password: hashedPassword,
        name,
        role: "faculty",
        isActive: false, // Faculty requires admin approval
      });
      await newUser.save();
      console.log(
        "✅ Faculty user created successfully, awaiting admin approval!"
      );
      return res
        .status(200)
        .json("Registration successful. Awaiting admin approval.");
    }

    // Handle Student/Alumni registration
    if (!enrollmentNo) {
      return res
        .status(400)
        .json(
          "Enrollment number is required for student or alumni registration"
        );
    }

    const student = await Student.findOne({
      EnrollmentNo: enrollmentNo,
      //EmailId: email, //Registration logic changed
    });
    if (!student) {
      return res.status(400).json("Enrollment number not found");
    }

    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      role: role || "student",
      enrollmentNo,
      isActive: true, // Auto-approve for student/alumni
    });

    await newUser.save();
    console.log("✅ User created successfully!");
    return res.status(200).json("Registration successful. Account activated.");
  } catch (err) {
    console.error("❌ Registration error:", err);
    return res.status(500).json({ error: err.message });
  }
};

//register-faculty

// ✅ LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json("User not found");

    if (!user.isActive) {
      return res.status(403).json("Your account is not yet approved by admin.");
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(400).json("Wrong email or password");
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 60 * 60 * 1000,
      path: "/",
    });

    const { password: _, ...userData } = user._doc;
    return res.status(200).json(userData);
  } catch (err) {
    console.error("❌ Login error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// ✅ VERIFY TOKEN
export const verifyToken = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      console.error("JWT verification failed:", err);
      return res.status(403).json({ error: "Invalid token" });
    }

    try {
      const user = await User.findById(decoded.id).select("-password");
      if (!user) return res.status(404).json({ error: "User not found" });

      return res.status(200).json({ user });
    } catch (dbErr) {
      console.error("❌ Error fetching user:", dbErr);
      return res.status(500).json({ error: "Database error" });
    }
  });
};

// ✅ LOGOUT
export const logout = (req, res) => {
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res.status(200).json({ message: "Successfully logged out." });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Logout failed", error: err.message });
  }
};

// ✅ UPDATE PROFILE PIC
export const updateProfilePic = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.body || !req.body.profilePic) {
      return res.status(400).json({ message: "Profile picture is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(
      req.body.profilePic,
      {
        folder: "profilePics",
        upload_preset: "default_preset",
      }
    );

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile picture updated successfully",
      profilePic: updatedUser.profilePic,
    });
  } catch (error) {
    console.error("❌ Error updating profile picture:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No user with this email found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000;
    await user.save();

    const CLIENT_URL =
      process.env.CLIENT_URL ||
      "https://alumni.sistec.ac.in" ||
      "https://skill-sync-frontend.onrender.com" ||
      "http://localhost:3000";

    const resetLink = `${CLIENT_URL}/reset-password/${resetToken}`;

    try {
      await sendResetEmail(user.email, resetLink); // ✅ email send
    } catch (emailErr) {
      console.error("❌ Error sending email:", emailErr.message);
      return res.status(500).json({ message: "Failed to send reset email." });
    }

    return res
      .status(200)
      .json({ message: "Password reset link has been sent to your email." });
  } catch (err) {
    console.error("❌ Forgot password error:", err.message, err.stack);
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ RESET PASSWORD
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json("Token invalid or expired");

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(200).json("Password has been successfully updated.");
  } catch (err) {
    console.error("❌ Reset password error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Secret for HMAC (store in .env in production)
const TOKEN_SECRET = process.env.TOKEN_SECRET || "my-secret-key";

//forgot Enrollment
export const forgotEnrollmentNo = async (req, res) => {
  const { email } = req.body;
  console.log("POST /API_B/auth/forgot-enrollment, email:", email);
  try {
    const student = await Student.findOne({ EmailId: email });
    if (!student) {
      return res.status(404).json({ message: "No student with this email" });
    }
    // Create token: Base64(email:expiry) + HMAC
    const expiry = Date.now() + 3600000; // 1 hour
    const payload = Buffer.from(`${email}:${expiry}`).toString("base64");
    const hmac = crypto
      .createHmac("sha256", TOKEN_SECRET)
      .update(payload)
      .digest("hex");
    const token = `${payload}.${hmac}`;
    console.log("Generated token:", token);
    const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
    const recoveryLink = `${CLIENT_URL}/recover-enrollment/${token}`;
    await sendRecoveryEmail(email, recoveryLink);
    return res
      .status(200)
      .json({ message: "Recovery link sent to your email" });
  } catch (err) {
    console.error("❌ Forgot enrollment error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

//recover enrollment
export const recoverEnrollmentNo = async (req, res) => {
  const { token } = req.params;
  console.log("GET /API_B/auth/recover-enrollment/", token);
  try {
    // Split token: payload.hmac
    const [payload, hmac] = token.split(".");
    if (!payload || !hmac) {
      return res.status(400).json({ message: "Invalid token format" });
    }
    // Verify HMAC
    const expectedHmac = crypto
      .createHmac("sha256", TOKEN_SECRET)
      .update(payload)
      .digest("hex");
    if (hmac !== expectedHmac) {
      return res.status(400).json({ message: "Invalid token signature" });
    }
    // Decode payload
    const decoded = Buffer.from(payload, "base64").toString();
    const [email, expiry] = decoded.split(":");
    if (!email || !expiry) {
      return res.status(400).json({ message: "Invalid token payload" });
    }
    console.log("Decoded email:", email, "Expiry:", expiry);
    // Check expiry
    if (parseInt(expiry) < Date.now()) {
      return res.status(400).json({ message: "Token expired" });
    }
    // Query Student
    const student = await Student.findOne({ EmailId: email });
    if (!student) {
      return res
        .status(404)
        .json({ message: "No student found for this email" });
    }
    console.log("Student EnrollmentNo:", student.EnrollmentNo);
    return res.status(200).json({
      message: "Enrollment number retrieved",
      enrollmentNo: student.EnrollmentNo,
    });
  } catch (err) {
    console.error("❌ Recover enrollment error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};
