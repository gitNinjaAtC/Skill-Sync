import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    return storedUser || null;
  });
  const [loading, setLoading] = useState(true);

  const normalizeUser = (user) => {
    if (!user) return null;
    return {
      ...user,
      id: user._id || user.id, // Ensure `id` is present
    };
  };

  const login = async (inputs) => {
    try {
      const res = await axios.post(
        "http://localhost:8800/API_B/auth/login",
        inputs,
        { withCredentials: true }
      );

      const normalized = normalizeUser(res.data);
      setCurrentUser(normalized);
      localStorage.setItem("user", JSON.stringify(normalized));
      return res;
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
      throw err.response?.data || err.message;
    }
  };

  const logout = async () => {
    try {
      await axios.post("http://localhost:8800/API_B/auth/logout", null, {
        withCredentials: true,
      });
    } catch (err) {
      console.error("Logout failed:", err.response?.data || err.message);
    } finally {
      setCurrentUser(null);
      localStorage.removeItem("user");
      console.log("Logout successful");
    }
  };

  const verifyToken = async () => {
    try {
      console.log("Verifying token, checking cookies...");
      const res = await axios.get("http://localhost:8800/API_B/auth/verify", {
        withCredentials: true,
      });

      const normalized = normalizeUser(res.data.user);
      setCurrentUser(normalized);
      localStorage.setItem("user", JSON.stringify(normalized));
      return res.data;
    } catch (err) {
      console.error("Token verification failed:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      setCurrentUser(null);
      localStorage.removeItem("user");
      throw err;
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        try {
          await verifyToken();
        } catch {
          console.log("Invalid session. Clearing...");
          setCurrentUser(null);
          localStorage.removeItem("user");
        }
      }

      setLoading(false);
    };

    checkSession();
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("user", JSON.stringify(currentUser));
    }
  }, [currentUser]);

  return (
    <AuthContext.Provider
      value={{ currentUser, login, logout, verifyToken, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
