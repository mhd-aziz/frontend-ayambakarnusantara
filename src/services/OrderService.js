// src/services/OrderService.js
import axios from "axios";

/**
 * Membuat pesanan baru.
 * @param {object} orderData - Data untuk pesanan baru.
 * @param {string} orderData.paymentMethod - Metode pembayaran (PAY_AT_STORE atau ONLINE_PAYMENT).
 * @param {string} [orderData.notes] - Catatan tambahan untuk pesanan.
 * @returns {Promise<object>} Respons API yang berisi detail pesanan yang berhasil dibuat.
 * @throws {Error} Error object dari API jika terjadi kesalahan.
 */
const createOrder = async (orderData) => {
  if (!orderData || !orderData.paymentMethod) {
    const err = new Error("Metode pembayaran (paymentMethod) wajib diisi.");
    // @ts-ignore
    err.success = false;
    // @ts-ignore
    err.statusCode = 400;
    throw err;
  }

  if (
    orderData.paymentMethod !== "PAY_AT_STORE" &&
    orderData.paymentMethod !== "ONLINE_PAYMENT"
  ) {
    const err = new Error(
      "Metode pembayaran tidak valid. Gunakan 'PAY_AT_STORE' atau 'ONLINE_PAYMENT'."
    );
    // @ts-ignore
    err.success = false;
    // @ts-ignore
    err.statusCode = 400;
    throw err;
  }

  try {
    const response = await axios.post(`/api/order`, orderData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw error;
  }
};

/**
 * Mendapatkan daftar pesanan pengguna yang sedang login.
 * @returns {Promise<Array<object>>} Respons API yang berisi array objek pesanan.
 * @throws {Error} Error object dari API jika terjadi kesalahan.
 */
const getUserOrders = async () => {
  try {
    const response = await axios.get(`/api/order`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw error;
  }
};

/**
 * Mendapatkan detail pesanan spesifik untuk pelanggan.
 * @param {string} orderId - ID unik dari pesanan yang ingin dilihat detailnya.
 * @returns {Promise<object>} Respons API yang berisi detail pesanan dan detail toko.
 * @throws {Error} Error object dari API jika orderId tidak ada atau terjadi kesalahan.
 */
const getCustomerOrderDetailById = async (orderId) => {
  if (!orderId) {
    const err = new Error("orderId tidak boleh kosong.");
    // @ts-ignore
    err.isValidationError = true;
    // @ts-ignore
    err.statusCode = 400;
    throw err;
  }
  try {
    const response = await axios.get(`/api/order/customer/${orderId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw error;
  }
};

/**
 * Membatalkan pesanan oleh pelanggan.
 * @param {string} orderId - ID unik dari pesanan yang ingin dibatalkan.
 * @returns {Promise<object>} Respons API yang berisi detail pesanan yang telah diperbarui.
 * @throws {Error} Error object dari API jika orderId tidak ada atau terjadi kesalahan.
 */
const cancelOrderAsCustomer = async (orderId) => {
  if (!orderId) {
    const err = new Error(
      "orderId tidak boleh kosong untuk membatalkan pesanan."
    );
    // @ts-ignore
    err.isValidationError = true;
    // @ts-ignore
    err.statusCode = 400;
    throw err;
  }
  try {
    const response = await axios.patch(
      `/api/order/${orderId}/cancel`,
      {},
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw error;
  }
};

/**
 * Mendapatkan semua pesanan untuk seller yang sedang login dengan opsi filter.
 * @param {object} [filters={}] - Objek filter opsional.
 * @param {string} [filters.orderId] - Filter berdasarkan ID pesanan (substring, case-insensitive).
 * @param {string} [filters.status] - Filter berdasarkan status pesanan (e.g., "COMPLETED", "ALL").
 * @param {string} [filters.customerUserId] - Filter berdasarkan ID pengguna customer (exact match).
 * @param {string} [filters.customerSearch] - Filter berdasarkan nama atau email customer (substring, case-insensitive).
 * @returns {Promise<object>} Respons API yang berisi daftar pesanan dan detail customer.
 * @throws {Error} Error object dari API jika terjadi kesalahan.
 */
const getSellerOrders = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.orderId) params.append("orderId", filters.orderId);
  if (filters.status && filters.status !== "ALL")
    params.append("status", filters.status);
  if (filters.customerUserId)
    params.append("customerUserId", filters.customerUserId);
  if (filters.customerSearch)
    params.append("customerSearch", filters.customerSearch);
  // Tambahkan parameter lain seperti page dan limit jika backend mendukungnya nanti
  // if (filters.page) params.append("page", filters.page);
  // if (filters.limit) params.append("limit", filters.limit);

  try {
    const response = await axios.get(`/api/order/seller/all`, {
      params,
      withCredentials: true,
    });
    return response.data; // Respons diharapkan: { success: true, message: "...", data: [orders_with_customer_details] }
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    const defaultError = {
      success: false,
      message:
        error.message ||
        "Terjadi kesalahan pada server saat mengambil pesanan seller.",
      statusCode: error.response?.status || 500,
    };
    throw defaultError;
  }
};

/**
 * Mendapatkan detail pesanan spesifik untuk seller.
 * @param {string} orderId - ID unik dari pesanan yang ingin dilihat detailnya.
 * @returns {Promise<object>} Respons API yang berisi detail pesanan dan detail pelanggan.
 * @throws {Error} Error object dari API jika orderId tidak ada atau terjadi kesalahan.
 */
const getSellerOrderDetailById = async (orderId) => {
  if (!orderId) {
    const err = new Error(
      "orderId tidak boleh kosong untuk mengambil detail pesanan seller."
    );
    // @ts-ignore
    err.isValidationError = true;
    // @ts-ignore
    err.statusCode = 400;
    throw err;
  }
  try {
    const response = await axios.get(`/api/order/seller/${orderId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw error;
  }
};

/**
 * Memperbarui status pesanan oleh seller.
 * @param {string} orderId - ID unik dari pesanan yang akan diperbarui.
 * @param {string} status - Status baru untuk pesanan.
 * Harus salah satu dari: "PROCESSING", "READY_FOR_PICKUP", "COMPLETED", "CONFIRMED".
 * @returns {Promise<object>} Respons API yang berisi detail pesanan yang telah diperbarui.
 * @throws {Error} Error object dari API jika terjadi kesalahan atau status tidak valid.
 */
const updateOrderStatusBySeller = async (orderId, status) => {
  if (!orderId) {
    const err = new Error(
      "orderId tidak boleh kosong untuk memperbarui status pesanan."
    );
    // @ts-ignore
    err.isValidationError = true;
    // @ts-ignore
    err.statusCode = 400;
    throw err;
  }
  const validStatuses = [
    "PROCESSING",
    "READY_FOR_PICKUP",
    "COMPLETED",
    "CONFIRMED",
  ];
  if (!status || !validStatuses.includes(status)) {
    const err = new Error(
      `Status pesanan tidak valid. Pilih dari: ${validStatuses.join(", ")}.`
    );
    // @ts-ignore
    err.isValidationError = true;
    // @ts-ignore
    err.statusCode = 400;
    throw err;
  }

  try {
    const response = await axios.patch(
      `/api/order/${orderId}/seller/status`,
      { newStatus: status },
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw error;
  }
};

/**
 * Mengonfirmasi pembayaran (misalnya untuk PAY_AT_STORE) dan mengunggah bukti transaksi oleh seller.
 * @param {string} orderId - ID unik dari pesanan.
 * @param {FormData} formData - Data form yang berisi paymentProofs (file/files) dan paymentConfirmationNotes (string).
 * @returns {Promise<object>} Respons API yang berisi detail pesanan yang telah diperbarui.
 * @throws {Error} Error object dari API jika terjadi kesalahan.
 */
const confirmPaymentBySeller = async (orderId, formData) => {
  if (!orderId) {
    const err = new Error(
      "orderId tidak boleh kosong untuk konfirmasi pembayaran."
    );
    // @ts-ignore
    err.success = false;
    // @ts-ignore
    err.statusCode = 400;
    throw err;
  }
  try {
    const response = await axios.patch(
      `/api/order/${orderId}/seller/confirm-payment`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    const defaultError = {
      success: false,
      message:
        error.message ||
        "Terjadi kesalahan pada server saat konfirmasi pembayaran.",
      statusCode: error.response?.status || 500,
    };
    throw defaultError;
  }
};

/**
 * Mendapatkan bukti dan catatan pembayaran untuk pesanan tertentu.
 * @param {string} orderId - ID unik dari pesanan.
 * @returns {Promise<object>} Respons API yang berisi objek data dengan confirmationNotes dan proofImageURLs.
 * @throws {Error} Error object dari API jika terjadi kesalahan.
 */
const getOrderPaymentProofs = async (orderId) => {
  if (!orderId) {
    const err = new Error(
      "orderId tidak boleh kosong untuk mengambil bukti pembayaran."
    );
    // @ts-ignore
    err.isValidationError = true;
    // @ts-ignore
    err.statusCode = 400;
    throw err;
  }
  try {
    const response = await axios.get(`/api/order/${orderId}/payment-proofs`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    const defaultError = {
      success: false,
      message:
        error.message ||
        "Terjadi kesalahan pada server saat mengambil bukti pembayaran.",
      statusCode: error.response?.status || 500,
    };
    throw defaultError;
  }
};

export {
  createOrder,
  getUserOrders,
  getCustomerOrderDetailById,
  cancelOrderAsCustomer,
  getSellerOrders,
  getSellerOrderDetailById,
  updateOrderStatusBySeller,
  confirmPaymentBySeller,
  getOrderPaymentProofs,
};
