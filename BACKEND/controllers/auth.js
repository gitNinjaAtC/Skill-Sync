import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/Users.js";
import Student from "../models/Student.js";
import cloudinary from "../lib/cloudinary.js";
import { sendResetEmail } from "../lib/sendEmail.js";


// ✅ REGISTER
export const register = async (req, res) => {
  console.log("Register route hit, body:", req.body);
  try {
    const { email, password, name, role, enrollmentNo } = req.body;

    if (role === "admin") {
      return res.status(403).json("Admin registration is not allowed");
    }

    const student = await Student.findOne({
      EnrollmentNo: enrollmentNo,
      EmailId: email,
    });

    if (!student) {
      return res.status(400).json("Email and enrollment number do not match");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json("User already exists");

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      role: role || "student",
      enrollmentNo,
    });

    await newUser.save();
    console.log("✅ User created successfully!");
    return res
      .status(200)
      .json("Registration successful. Awaiting admin approval.");
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
    return res.status(500).json({ message: "Logout failed", error: err.message });
  }
};

// ✅ UPDATE PROFILE PIC
export const updateProfilePic = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.body || !req.body.profilePic) {
      return res.status(400).json({ message: "Profile picture is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(req.body.profilePic, {
      folder: "profilePics",
      upload_preset: "default_preset",
    });

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

    return res.status(200).json({ message: "Password reset link has been sent to your email." });
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
