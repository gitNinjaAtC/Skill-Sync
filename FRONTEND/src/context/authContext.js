import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const [loading, setLoading] = useState(true);

  const login = async (inputs) => {
    try {
      const res = await axios.post(
        "http://localhost:8800/API_B/auth/login",
        inputs,
        {
          withCredentials: true,
        }
      );
      console.log("Login response:", res.data);
      setCurrentUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
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
      setCurrentUser(null);
      localStorage.removeItem("user");
      console.log("Logout successful");
    } catch (err) {
      console.error("Logout failed:", err.response?.data || err.message);
      setCurrentUser(null);
      localStorage.removeItem("user");
    }
  };

  const verifyToken = async () => {
    try {
      console.log("Verifying token, checking cookies...");
      const res = await axios.get("http://localhost:8800/API_B/auth/verify", {
        withCredentials: true,
      });
      console.log("Token verification successful:", res.data);
      setCurrentUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      return res.data;
    } catch (err) {
      console.error("Token verification failed:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        headers: err.response?.headers,
      });
      setCurrentUser(null);
      localStorage.removeItem("user");
      throw err;
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      console.log(
        "Checking session, currentUser:",
        !!currentUser,
        "localStorage.user:",
        localStorage.getItem("user")
      );
      const storedUser = localStorage.getItem("user");
      if (currentUser || storedUser) {
        try {
          await verifyToken();
        } catch (err) {
          console.log("Session invalid, cleared currentUser");
          if (storedUser && !currentUser) {
            console.log("Retrying with stored user:", storedUser);
            setCurrentUser(JSON.parse(storedUser));
            try {
              await verifyToken();
            } catch (retryErr) {
              console.log("Retry failed, clearing session");
            }
          }
        }
      } else {
        console.log(
          "No currentUser or localStorage.user, skipping verifyToken"
        );
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  useEffect(() => {
    console.log("Updating localStorage, currentUser:", !!currentUser);
    localStorage.setItem("user", JSON.stringify(currentUser));
  }, [currentUser]);

  return (
    <AuthContext.Provider
      value={{ currentUser, login, logout, verifyToken, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
