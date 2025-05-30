import axios from "axios";

// Fallbacks in case env vars are undefined
const apiBaseUrl = 
  process.env.NODE_ENV === "development"
    ? process.env.REACT_APP_API_BASE_URL_LOCAL || "http://localhost:8800"
    : process.env.REACT_APP_API_BASE_URL_PROD || "https://skill-sync-backend-522o.onrender.com";

export const makeRequest = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("API base URL is:", apiBaseUrl);
