/*
 * Service: profileService.js (PERBAIKAN)
 * Deskripsi: Perbaikan untuk menangani upload foto profil
 */

import axios from "axios";

const API_URL = "https://backend.main-tech.site";

// Setup axios instance dengan token
const apiClient = axios.create({
  baseURL: API_URL,
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handler error yang lebih informatif
const handleApiError = (error, defaultMessage) => {
  console.error("API Error:", error);

  if (error.response) {
    // Server merespons dengan status error
    console.error("Response data:", error.response.data);
    console.error("Response status:", error.response.status);

    const errorMessage =
      error.response.data?.message ||
      error.response.data?.error ||
      defaultMessage;
    throw new Error(errorMessage);
  } else if (error.request) {
    // Request dibuat tetapi tidak ada respons diterima
    console.error("No response received:", error.request);
    throw new Error(
      "Tidak dapat terhubung ke server. Silakan cek koneksi internet Anda."
    );
  } else {
    // Kesalahan dalam pembuatan request
    throw new Error(error.message || defaultMessage);
  }
};

// Mengambil profil admin
export const getAdminProfile = async () => {
  try {
    const response = await apiClient.get("/api/admin/profile");
    return response.data;
  } catch (error) {
    return handleApiError(error, "Gagal mengambil data profil admin");
  }
};

// Memperbarui profil admin
export const updateAdminProfile = async (profileData) => {
  try {
    console.log("Updating profile with data:", profileData);

    // FormData untuk mengirim file
    const formData = new FormData();

    // Tambahkan field jika disediakan
    if (profileData.username) formData.append("username", profileData.username);
    if (profileData.email) formData.append("email", profileData.email);
    if (profileData.fullName !== undefined)
      formData.append("fullName", profileData.fullName);
    if (profileData.address !== undefined)
      formData.append("address", profileData.address);
    if (profileData.birthDate)
      formData.append("birthDate", profileData.birthDate);

    // Tambahkan file foto jika ada
    if (profileData.photoAdmin) {
      console.log("Adding photo to FormData:", profileData.photoAdmin);
      formData.append("photoAdmin", profileData.photoAdmin);
    }

    // Debug: log FormData entries
    for (let pair of formData.entries()) {
      console.log(
        pair[0] + ": " + (pair[0] === "photoAdmin" ? "File object" : pair[1])
      );
    }

    const response = await apiClient.put("/api/admin/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("Profile update response:", response.data);
    return response.data;
  } catch (error) {
    return handleApiError(error, "Gagal memperbarui profil admin");
  }
};

// Export semua fungsi
const profileService = {
  getAdminProfile,
  updateAdminProfile,
};

export default profileService;
