/*
 * Service: orderService.js
 * Deskripsi: Service untuk komunikasi dengan API order admin
 * Digunakan di: ManageOrders.jsx
 *
 * Endpoint API:
 * - GET /admin/orders - Mengambil semua order
 * - GET /admin/orders/status - Mengambil order berdasarkan status
 * - GET /admin/payment/:paymentId/status - Mengambil status pembayaran
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

// Mengambil semua order
export const getAllOrders = async () => {
  try {
    const response = await apiClient.get("/api/admin/orders");
    console.log("Get all orders response:", response.data);
    return response.data;
  } catch (error) {
    return handleApiError(error, "Gagal mengambil daftar order");
  }
};

// Mengambil order berdasarkan status
export const getOrdersByStatus = async (status) => {
  try {
    const response = await apiClient.get(
      `/api/admin/orders/status?status=${status}`
    );
    console.log(`Get orders by status (${status}) response:`, response.data);
    return response.data;
  } catch (error) {
    return handleApiError(
      error,
      `Gagal mengambil order dengan status ${status}`
    );
  }
};

// Mengambil status pembayaran
export const getPaymentStatus = async (paymentId) => {
  try {
    const response = await apiClient.get(
      `/api/admin/payment/${paymentId}/status`
    );
    console.log(`Get payment status (${paymentId}) response:`, response.data);

    // Respons berisi objek payment dan midtransStatus
    // {
    //   "payment": { id, orderId, amount, snapToken, transactionId, status, statusOrder, dll },
    //   "midtransStatus": { transaction_status, order_id, payment_type, transaction_time, dll }
    // }

    return response.data;
  } catch (error) {
    return handleApiError(error, "Gagal mengambil status pembayaran");
  }
};
// Mengupdate status order
export const updateOrderStatus = async (orderId, statusOrder) => {
  try {
    const response = await apiClient.put(`/api/admin/order/${orderId}/status`, {
      statusOrder,
    });
    console.log(
      `Update order status (${orderId}) to ${statusOrder} response:`,
      response.data
    );
    return response.data;
  } catch (error) {
    return handleApiError(error, "Gagal mengupdate status order");
  }
};
// Export semua fungsi
const orderService = {
    getAllOrders,
    getOrdersByStatus,
    getPaymentStatus,
    updateOrderStatus
  };

export default orderService;
