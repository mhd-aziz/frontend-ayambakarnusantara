// src/services/ProfileService.js
import axios from "axios";

/**
 * Mengambil data profil pengguna yang sedang login.
 * @returns {Promise<object>} Data respons dari API.
 * @throws {object} Objek error.
 */
const getProfile = async () => {
  try {
    const response = await axios.get(`/api/profile/`, {
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

/**
 * Memperbarui data profil pengguna yang sedang login.
 * @param {FormData} formData - Data profil untuk diperbarui.
 * @returns {Promise<object>} Data respons dari API.
 * @throws {object} Objek error.
 */
const updateProfile = async (formData) => {
  try {
    const response = await axios.put(`/api/profile/update`, formData, {
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
