// src/api/api.ts
import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL;
const SECRET_KEY = import.meta.env.VITE_API_SECRET_KEY;
const HEADER_NAME = import.meta.env.VITE_API_HEADER_NAME;

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: false, 
  headers: {
    "Content-Type": "application/json",
    [HEADER_NAME]:`${SECRET_KEY}`
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});




export const loginApi = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
    [HEADER_NAME]:`${SECRET_KEY}`
  },
});
