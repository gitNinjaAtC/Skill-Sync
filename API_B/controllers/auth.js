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

//LOGIN

export const login = (req, res) => {
  try {
    const q = "SELECT * FROM users WHERE username = ?";

    db.query(q, [req.body.username], (err, data) => {
      if (err) return res.status(500).json({ error: err.message });
      if (data.length === 0) return res.status(404).json("User not found");

      // Check password
      const validPassword = bcrypt.compareSync(
        req.body.password,
        data[0].password
      );
      if (!validPassword)
        return res.status(400).json("Wrong password or username");

      // Generate JWT token with expiration time
      const token = jwt.sign({ id: data[0].id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      console.log(token);

      // Store token in an HTTP-Only cookie
      res.cookie("accessToken", token, {
        httpOnly: true, // Secure, prevents client-side JavaScript access
        secure: true, // Set to true in production with HTTPS
        sameSite: "Strict", // Prevents CSRF attacks
        maxAge: 60 * 60 * 1000, // 1 hour expiration
      });

      const { password, ...others } = data[0];

      return res.status(200).json(others);
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//LOGOUT

export const logout = (req, res) => {
  res
    .clearCookie("accessToken", {
      httpOnly: true, // Extra security
      secure: process.env.NODE_ENV === "production", // Secure only in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Lax for localhost
    })
    .status(200)
    .json("User has been logged out");
};
