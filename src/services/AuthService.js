// src/services/AuthService.js
import axios from "axios";

const registerUser = async (userData) => {
  try {
    const response = await axios.post(`/api/auth/register`, userData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Terjadi kesalahan pada server saat mendaftar.",
      }
    );
  }
};

const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`/api/auth/login`, credentials, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Terjadi kesalahan pada server saat login.",
      }
    );
  }
};

const forgotPassword = async (emailData) => {
  try {
    // Path untuk proxy, POST /api/auth/forgot-password -> backend /auth/forgot-password
    const response = await axios.post(
      `/api/auth/forgot-password`,
      emailData
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message:
          "Terjadi kesalahan pada server saat memproses permintaan lupa password.",
      }
    );
  }
};

const logoutUser = async () => {
  try {
    // Path untuk proxy, POST /api/auth/logout -> backend /auth/logout
    const response = await axios.post(
      `/api/auth/logout`,
      {}, 
      {
        withCredentials: true, 
      }
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        statusCode: error.response?.status || 500,
        message: "Terjadi kesalahan pada server saat logout.",
      }
    );
  }
};

export { registerUser, loginUser, forgotPassword, logoutUser };
