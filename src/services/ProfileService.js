// src/services/ProfileService.js
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "/api";

const getProfile = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/profile/`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        statusCode: error.response?.status || 500,
        message: "Terjadi kesalahan pada server saat mengambil profil.",
      }
    );
  }
};

const updateProfile = async (formData) => {
  try {
    const response = await axios.put(`${BASE_URL}/profile/update`, formData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        statusCode: error.response?.status || 500,
        message: "Terjadi kesalahan pada server saat memperbarui profil.",
      }
    );
  }
};

export { getProfile, updateProfile };
