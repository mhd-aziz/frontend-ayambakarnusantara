// src/services/authService.js
import axios from "axios";
import { API_URL } from "../utils/constants";

// Setup axios interceptors to include auth token in requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Register a new user
export const registerUser = async (username, email, password) => {
  try {
    const response = await axios.post(`${API_URL}/api/user/register`, {
      username,
      email,
      password,
    });

    // Store token in localStorage
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Login user
export const loginUser = async (identifier, password) => {
  try {
    const response = await axios.post(`${API_URL}/api/user/login`, {
      identifier,
      password,
    });

    // Store token in localStorage
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get user profile
export const getUserProfile = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/user/profile`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (profileData) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/user/profile`,
      profileData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Check if user is authenticated
export const isUserAuthenticated = () => {
  const token = localStorage.getItem("token");
  return !!token;
};

// Logout user
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  // You can also call an API endpoint to invalidate the token on the server if needed
};

// Get currently logged-in user
export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

// Get auth token
export const getAuthToken = () => {
  return localStorage.getItem("token");
};
