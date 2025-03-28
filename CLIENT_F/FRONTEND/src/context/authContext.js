import { createContext, useEffect, useState } from "react";
import axios from "axios";  

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const login = async (inputs) => {
    try {
      const res = await axios.post("http://localhost:8800/API_B/auth/login", inputs, {
        withCredentials: true,
      });

      setCurrentUser(res.data); // Set the current user after login
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(currentUser)); // Save to localStorage on change
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, login }}>
      {children}
    </AuthContext.Provider>
  );
};
