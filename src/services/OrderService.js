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
    // Melempar error agar bisa ditangani oleh komponen pemanggil
    // atau interceptor Axios global.
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    // Error jaringan atau lainnya
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
      {}, // Tidak ada request body untuk pembatalan dari sisi pelanggan
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

export {
  createOrder,
  getUserOrders,
  getCustomerOrderDetailById,
  cancelOrderAsCustomer,
};
