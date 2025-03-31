import React, { createContext, useState, useEffect } from "react";
import {
  registerUser,
  loginUser,
  getUserProfile,
} from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const checkLoggedIn = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        setIsAuthenticated(true);
        const userData = JSON.parse(localStorage.getItem("user"));
        setUser(userData);

        try {
          // Optional: Validate token and get fresh user data
          const userProfile = await getUserProfile();
          setUser(userProfile);
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          // Token might be expired or invalid
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    };

    checkLoggedIn();
  }, []);

  // Register function
  const register = async (username, email, password) => {
    setLoading(true);
    try {
      const response = await registerUser(username, email, password);
      setIsAuthenticated(true);
      setUser(response.user);
      return response;
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (identifier, password) => {
    setLoading(true);
    try {
      const response = await loginUser(identifier, password);
      setIsAuthenticated(true);
      setUser(response.user);
      return response;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
