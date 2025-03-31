/*
 * Service: productService.js
 * Deskripsi: Service untuk komunikasi dengan API produk admin
 * Digunakan di: ManageProducts.jsx
 *
 * Endpoint API:
 * - GET /admin/products - Mengambil daftar produk
 * - POST /admin/product - Membuat produk baru
 * - PUT /admin/product - Memperbarui produk
 * - DELETE /admin/product/:productId - Menghapus produk
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

// Mengambil daftar produk dengan pagination dan search
export const getProducts = async (page = 1, limit = 10, search = "") => {
  try {
    let url = `/api/admin/products?page=${page}&limit=${limit}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    return handleApiError(error, "Gagal mengambil daftar produk");
  }
};

// Membuat produk baru
export const createProduct = async (productData) => {
  try {
    // FormData untuk mengirim file
    const formData = new FormData();

    // Tambahkan field teks ke FormData
    formData.append("name", productData.name);
    formData.append("price", productData.price);
    formData.append("stock", productData.stock);

    // Tambahkan deskripsi jika ada
    if (productData.description) {
      formData.append("description", productData.description);
    }

    // Tambahkan file gambar jika ada
    if (productData.photoProduct) {
      formData.append("photoProduct", productData.photoProduct);
    }

    // Debug: log data yang akan dikirim (tanpa file untuk readability)
    console.log("Creating product with data:", {
      name: productData.name,
      price: productData.price,
      stock: productData.stock,
      description: productData.description,
      hasPhoto: !!productData.photoProduct,
    });

    // Kirim request
    const response = await apiClient.post("/api/admin/product", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("Create product response:", response.data);
    return response.data;
  } catch (error) {
    return handleApiError(error, "Gagal membuat produk baru");
  }
};

// Memperbarui produk
export const updateProduct = async (productId, productData) => {
  try {
    // FormData untuk mengirim file
    const formData = new FormData();

    // Tambahkan productId
    formData.append("productId", productId);

    // Tambahkan field lain jika disediakan
    if (productData.name) formData.append("name", productData.name);
    if (productData.description)
      formData.append("description", productData.description);
    if (productData.price) formData.append("price", productData.price);
    if (productData.stock) formData.append("stock", productData.stock);

    // Tambahkan file gambar jika ada
    if (productData.photoProduct) {
      formData.append("photoProduct", productData.photoProduct);
    }

    const response = await apiClient.put("/api/admin/product", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    return handleApiError(error, "Gagal memperbarui produk");
  }
};

// Menghapus produk
export const deleteProduct = async (productId) => {
  try {
    const response = await apiClient.delete(`/api/admin/product/${productId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error, "Gagal menghapus produk");
  }
};

// Export semua fungsi
const productService = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};

export default productService;
