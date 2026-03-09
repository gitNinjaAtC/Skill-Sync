import { createContext, useEffect, useState, useCallback } from "react";
import { makeRequest } from "../axios";

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
      const res = await makeRequest.post(
        "/API_B/auth/login",
        inputs
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
      await makeRequest.post("/API_B/auth/logout", null);
    } catch (err) {
      console.error("Logout failed:", err.response?.data || err.message);
    } finally {
      setCurrentUser(null);
      localStorage.removeItem("user");
      console.log("Logout successful");
    }
  };

  const verifyToken = useCallback(async () => {
    try {
      console.log("Verifying token, checking cookies...");
      const res = await makeRequest.get("/API_B/auth/verify");

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
  }, []);

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
  }, [verifyToken]);

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
