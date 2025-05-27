// src/services/MenuService.js
import axios from "axios";

// Fungsi createApiError dihapus karena tidak akan digunakan lagi.

/**
 * Mengambil daftar produk publik dengan opsi filter, sorting, dan pagination.
 * @param {object} params - Parameter query.
 * @param {string} [params.category] - Filter produk berdasarkan kategori.
 * @param {string} [params.sortBy] - Field untuk mengurutkan produk (misal: price, createdAt, name).
 * @param {string} [params.order] - Urutan sorting (asc untuk ascending, desc untuk descending). Default: asc.
 * @param {number} [params.page] - Nomor halaman untuk pagination. Default: 1.
 * @param {number} [params.limit] - Jumlah produk per halaman. Default: 10.
 * @param {string} [params.shopId] - Filter produk berdasarkan ID toko (Opsional, jika backend mendukung).
 * @returns {Promise<object>} Data respons dari API.
 * @throws {Error} Jika terjadi kesalahan jaringan atau server mengembalikan respons error.
 */
const getProducts = async (params = {}) => {
  try {
    const response = await axios.get(`/api/product`, {
      params,
      // withCredentials: true, // Untuk API publik, withCredentials biasanya tidak diperlukan kecuali ada kasus khusus
    });
    // Jika backend selalu mengembalikan struktur { success: boolean, ... },
    // Anda bisa menambahkan pengecekan di sini sebelum melempar error.
    // Namun, jika error sudah ditangani oleh interceptor atau Anda ingin komponen yang menangani,
    // cukup return response.data
    return response.data;
  } catch (error) {
    // Melempar error agar bisa ditangani oleh komponen pemanggil
    // atau interceptor Axios global.
    // Jika error.response.data sudah berisi pesan error yang diinginkan:
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    // Error jaringan atau lainnya
    throw error;
  }
};

/**
 * Mengambil detail produk berdasarkan ID (API Publik).
 * @param {string} productId - ID dari produk yang ingin diambil.
 * @returns {Promise<object>} Data respons dari API.
 * @throws {Error} Jika productId tidak ada, atau terjadi kesalahan jaringan/server.
 */
const getProductById = async (productId) => {
  if (!productId) {
    // Untuk error validasi sisi klien, kita bisa melempar error standar
    const err = new Error("productId tidak boleh kosong.");
    // Anda bisa menambahkan properti custom jika diperlukan oleh penanganan error di komponen
    // err.statusCode = 400;
    // err.isValidationError = true;
    throw err;
  }
  try {
    const response = await axios.get(`/api/product/${productId}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw error;
  }
};

/**
 * Membuat produk baru oleh seller yang sedang login.
 * @param {FormData} productData - Data produk dalam bentuk FormData.
 * @returns {Promise<Object>} Data respons dari API.
 * @throws {Error} Jika terjadi kesalahan.
 */
const createProduct = async (productData) => {
  // Validasi dasar di frontend bisa tetap ada jika diinginkan,
  // tapi fokus utama adalah validasi backend.
  // Contoh: if (!productData.get('name')) throw new Error("Nama produk wajib diisi.");

  try {
    const response = await axios.post(`/api/product`, productData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
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
 * Memperbarui produk yang sudah ada oleh seller.
 * @param {string} productId - ID produk yang akan diperbarui.
 * @param {FormData} productUpdateData - Data produk untuk pembaruan.
 * @returns {Promise<Object>} Data respons dari API.
 * @throws {Error} Jika terjadi kesalahan.
 */
const updateProduct = async (productId, productUpdateData) => {
  if (!productId) {
    const err = new Error(
      "productId tidak boleh kosong untuk memperbarui produk."
    );
    throw err;
  }
  try {
    const response = await axios.put(
      `/api/product/${productId}`,
      productUpdateData,
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
    throw error;
  }
};

/**
 * Menghapus produk berdasarkan ID oleh seller.
 * @param {string} productId - ID dari produk yang akan dihapus.
 * @returns {Promise<Object>} Data respons dari API.
 * @throws {Error} Jika terjadi kesalahan.
 */
const deleteProduct = async (productId) => {
  if (!productId) {
    const err = new Error(
      "productId tidak boleh kosong untuk menghapus produk."
    );
    throw err;
  }
  try {
    const response = await axios.delete(`/api/product/${productId}`, {
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
 * Mengambil daftar produk milik seller yang sedang login.
 * @returns {Promise<Object>} Data respons dari API yang berisi daftar produk seller.
 * @throws {Error} Jika terjadi kesalahan jaringan atau server.
 */
const getMyProducts = async () => {
  try {
    // Path untuk proxy, GET /api/product/my-products -> backend /product/my-products
    const response = await axios.get(`/api/product/my-products`, {
      withCredentials: true, // Operasi ini memerlukan autentikasi penjual
    });
    return response.data; // Berisi { message: "...", data: [...] }
  } catch (error) {
    // Melempar error agar bisa ditangani oleh komponen pemanggil
    // atau interceptor Axios global.
    if (error.response && error.response.data) {
      throw error.response.data; // error.response.data diharapkan berisi { success: false, message: "pesan error", statusCode: ... }
    }
    // Error jaringan atau lainnya
    throw error; // Ini akan menjadi error Axios standar
  }
};

export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
};
