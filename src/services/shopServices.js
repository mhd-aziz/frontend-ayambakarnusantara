/*
 * Service: shopService.js
 * Deskripsi: Service untuk komunikasi dengan API toko admin
 * Digunakan di: ManageShop.jsx
 *
 * Endpoint API:
 * - GET /admin/shop - Mengambil detail toko
 * - POST /admin/shop - Membuat toko baru
 * - PUT /admin/shop - Memperbarui toko
 * - DELETE /admin/shop - Menghapus toko
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

// Mengambil detail toko
export const getShop = async () => {
  try {
    const response = await apiClient.get("/api/admin/shop");
    return response.data.data;
  } catch (error) {
    return handleApiError(error, "Gagal mengambil data toko");
  }
};

// Membuat toko baru
export const createShop = async (shopData) => {
  try {
    // FormData untuk mengirim file
    const formData = new FormData();

    // Tambahkan field teks ke FormData
    formData.append("name", shopData.name);
    formData.append("address", shopData.address);

    // Tambahkan file gambar jika ada
    if (shopData.photoShop) {
      formData.append("photoShop", shopData.photoShop);
    }

    // Debug: log data yang akan dikirim (tanpa file untuk readability)
    console.log("Creating shop with data:", {
      name: shopData.name,
      address: shopData.address,
      hasPhoto: !!shopData.photoShop,
    });

    // Kirim request
    const response = await apiClient.post("/api/admin/shop", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("Create shop response:", response.data);
    return response.data.data;
  } catch (error) {
    return handleApiError(error, "Gagal membuat toko baru");
  }
};

// Memperbarui toko
export const updateShop = async (shopData) => {
  try {
    // FormData untuk mengirim file
    const formData = new FormData();

    // Tambahkan field jika disediakan
    if (shopData.name) formData.append("name", shopData.name);
    if (shopData.address) formData.append("address", shopData.address);

    // Tambahkan file gambar jika ada
    if (shopData.photoShop) {
      formData.append("photoShop", shopData.photoShop);
    }

    const response = await apiClient.put("/api/admin/shop", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data;
  } catch (error) {
    return handleApiError(error, "Gagal memperbarui toko");
  }
};

// Menghapus toko
export const deleteShop = async () => {
  try {
    const response = await apiClient.delete("/api/admin/shop");
    return response.data;
  } catch (error) {
    return handleApiError(error, "Gagal menghapus toko");
  }
};

// Export semua fungsi
const shopService = {
  getShop,
  createShop,
  updateShop,
  deleteShop,
};

export default shopService;
