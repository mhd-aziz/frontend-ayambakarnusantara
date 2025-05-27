// src/services/ProductService.js
import axios from "axios";

/**
 * Membuat objek Error kustom dengan properti tambahan.
 * @param {string} message - Pesan error.
 * @param {number} statusCode - Kode status HTTP.
 * @param {string} [status="error"] - Status error.
 * @param {object} [data=null] - Data tambahan dari respons error.
 * @returns {Error} Objek Error yang telah diperkaya.
 */
const createApiError = (message, statusCode, status = "error", data = null) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.status = status;
  if (data) {
    error.data = data; // Menyimpan data error asli jika ada
  }
  return error;
};

/**
 * Mengambil daftar produk dengan opsi filter, sorting, dan pagination.
 * @param {object} params - Parameter query.
 * @param {string} [params.category] - Filter produk berdasarkan kategori.
 * @param {string} [params.sortBy] - Field untuk mengurutkan produk (misal: price, createdAt, name).
 * @param {string} [params.order] - Urutan sorting (asc untuk ascending, desc untuk descending). Default: asc.
 * @param {number} [params.page] - Nomor halaman untuk pagination. Default: 1.
 * @param {number} [params.limit] - Jumlah produk per halaman. Default: 10.
 * @returns {Promise<object>} Data respons dari API yang berisi daftar produk dan informasi pagination.
 * @throws {Error} Objek Error dengan properti statusCode, status, dan message.
 */
const getProducts = async (params = {}) => {
  try {
    // Path untuk proxy adalah /api/product
    const response = await axios.get(`/api/product`, {
      params,
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || // Pesan dari backend
      (error.isAxiosError && error.message) || // Pesan dari error Axios
      "Terjadi kesalahan pada server saat mengambil daftar produk."; // Pesan default
    const statusCode = error.response?.status || 500;
    const status = error.response?.data?.status || "error";

    throw createApiError(message, statusCode, status, error.response?.data);
  }
};

/**
 * Mengambil detail produk berdasarkan ID.
 * @param {string} productId - ID dari produk yang ingin diambil.
 * @returns {Promise<object>} Data respons dari API yang berisi detail produk.
 * @throws {Error} Objek Error dengan properti statusCode, status, dan message.
 */
const getProductById = async (productId) => {
  if (!productId) {
    // Melempar instance dari Error
    throw createApiError(
      "productId tidak boleh kosong.",
      400,
      "error_validation"
    );
  }
  try {
    // Path untuk proxy adalah /api/product/:productId
    const response = await axios.get(`/api/product/${productId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || // Pesan dari backend
      (error.isAxiosError && error.message) || // Pesan dari error Axios
      "Terjadi kesalahan pada server saat mengambil detail produk."; // Pesan default
    const statusCode = error.response?.status || 500;
    const status = error.response?.data?.status || "error";

    throw createApiError(message, statusCode, status, error.response?.data);
  }
};

export { getProducts, getProductById };
