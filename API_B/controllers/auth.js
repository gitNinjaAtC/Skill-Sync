import { db } from "../connect.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

//REGISTER
export const register = (req, res) => {
  const q = "SELECT * FROM users WHERE username = ?";

  db.query(q, [req.body.username], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length > 0) return res.status(409).json("User already exists");

    //HASH PASSWORD
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);

    const insertQuery =
      "INSERT INTO users (username, email, password, name) VALUES (?)";
    const values = [
      req.body.username,
      req.body.email,
      hashedPassword,
      req.body.name,
    ];

    db.query(insertQuery, [values], (err, data) => {
      if (err) return res.status(500).json(err);
      else console.log("User created successfully!");
      return res.status(200).json("User created");
    });
  });
};

//login
export const login = (req, res) => {
  try {
    const q = "SELECT * FROM users WHERE username = ?";

    db.query(q, [req.body.username], (err, data) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: err.message });
      }
      if (data.length === 0) return res.status(404).json("User not found");

      const validPassword = bcrypt.compareSync(
        req.body.password,
        data[0].password
      );
      if (!validPassword)
        return res.status(400).json("Wrong password or username");

      const token = jwt.sign({ id: data[0].id , role: data[0].role}, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      const decoded = jwt.decode(token);
      console.log("Generated token:", token);
      console.log("Token payload:", {
        id: decoded.id,
        iat: new Date(decoded.iat * 1000).toISOString(),
        exp: new Date(decoded.exp * 1000).toISOString(),
      });

      // Clear old cookie
      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
      });

      // Set new cookie
      res.cookie("accessToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 60 * 60 * 1000, // 1 hour
        path: "/",
      });

      console.log("Set cookie: accessToken=", token.substring(0, 10) + "...");
      const { password, ...others } = data[0];
      return res.status(200).json(others);
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: error.message });
  }
};

//LOGOUT

export const logout = (req, res) => {
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", // Align with login
    });
    return res.status(200).json({ message: "Successfully logged out." });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Logout failed", error: err.message });
  }
};
