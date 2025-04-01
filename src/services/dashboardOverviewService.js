/*
 * Service: dashboardOverviewService.js
 * Deskripsi: Service untuk komunikasi dengan API dashboard (order statistics, dsb.)
 * Digunakan di: DashboardOverview.jsx
 *
 * Endpoint API yang di-handle:
 * - GET /api/admin/order-statistics
 * - GET /api/shop/:shopId/ratings
 * - GET /api/products
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

// Ambil data order-statistics
export const getOrderStatistics = async () => {
  try {
    // Panggil endpoint
    const response = await apiClient.get("/api/admin/order-statistics");
    // Kembalikan data respons
    return response.data;
  } catch (error) {
    return handleApiError(error, "Gagal mengambil data statistik pesanan");
  }
};

// Ambil data rating toko
export const getShopRating = async (shopId) => {
  try {
    const response = await apiClient.get(`/api/shop/${shopId}/ratings`);
    // Kembalikan data respons
    return response.data;
  } catch (error) {
    return handleApiError(error, "Gagal mengambil data rating toko");
  }
};

// Ambil data semua produk (untuk mendapatkan total products)
// Response:
// {
//   "products": [...],
//   "pagination": { "total": 2, ...},
//   ...
// }
export const getAllProducts = async () => {
  try {
    const response = await apiClient.get("/api/products");
    return response.data;
  } catch (error) {
    return handleApiError(error, "Gagal mengambil data produk");
  }
};

// Export semua fungsi dalam object, jika perlu
const dashboardOverviewService = {
  getOrderStatistics,
  getShopRating,
  getAllProducts,
};

export default dashboardOverviewService;
