// src/services/PaymentService.js
import axios from "axios";

/**
 * Membuat transaksi pembayaran Midtrans untuk pesanan tertentu.
 * @param {string} orderId - ID unik dari pesanan yang akan dibayar.
 * @returns {Promise<object>} Respons API yang berisi token dan redirect_url dari Midtrans.
 * @throws {Error} Error object dari API jika terjadi kesalahan.
 */
const createMidtransTransaction = async (orderId) => {
  if (!orderId) {
    const err = new Error(
      "orderId tidak boleh kosong untuk membuat transaksi pembayaran."
    );
    // @ts-ignore
    err.success = false;
    // @ts-ignore
    err.statusCode = 400;
    throw err;
  }
  try {
    const response = await axios.post(
      `/api/payment/charge/${orderId}`,
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
 * Mencoba ulang pembayaran Midtrans untuk pesanan tertentu.
 * @param {string} orderId - ID unik dari pesanan yang pembayarannya akan dicoba ulang.
 * @returns {Promise<object>} Respons API yang berisi token baru dan redirect_url baru dari Midtrans.
 * @throws {Error} Error object dari API jika terjadi kesalahan.
 */
const retryMidtransPayment = async (orderId) => {
  if (!orderId) {
    const err = new Error(
      "orderId tidak boleh kosong untuk mencoba ulang pembayaran."
    );
    // @ts-ignore
    err.success = false;
    // @ts-ignore
    err.statusCode = 400;
    throw err;
  }
  try {
    const response = await axios.post(
      `/api/payment/retry/${orderId}`,
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
 * Mendapatkan status transaksi Midtrans untuk pesanan tertentu.
 * @param {string} orderId - ID unik dari pesanan yang status transaksinya ingin dilihat.
 * @returns {Promise<object>} Respons API yang berisi detail status transaksi Midtrans dan status pesanan internal.
 * @throws {Error} Error object dari API jika terjadi kesalahan.
 */
const getMidtransTransactionStatus = async (orderId) => {
  if (!orderId) {
    const err = new Error(
      "orderId tidak boleh kosong untuk mendapatkan status transaksi."
    );
    // @ts-ignore
    err.success = false;
    // @ts-ignore
    err.statusCode = 400;
    throw err;
  }
  try {
    const response = await axios.get(`/api/payment/status/${orderId}`, {
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

export {
  createMidtransTransaction,
  retryMidtransPayment,
  getMidtransTransactionStatus,
};
