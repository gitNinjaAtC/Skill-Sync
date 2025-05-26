import axios from "axios";

export const makeRequest = axios.create({
    baseURL: "https://skill-sync-backend-522o.onrender.com",
    withCredentials: true,
    });
