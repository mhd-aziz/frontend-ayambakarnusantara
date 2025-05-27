// src/services/ShopService.js
import axios from "axios";

/**
 * Membuat toko baru untuk pengguna yang sedang login.
 * @param {Object} shopData - Data untuk membuat toko.
 * @param {string} shopData.description - Deskripsi toko (required).
 * @param {File} [shopData.bannerImage] - File gambar untuk banner toko (opsional).
 * @returns {Promise<Object>} Data toko yang baru dibuat atau error.
 */
const createShop = async (shopData) => {
  const formData = new FormData();
  formData.append("description", shopData.description);

  if (shopData.bannerImage) {
    formData.append("bannerImage", shopData.bannerImage);
  }

  try {
    const response = await axios.post(`/api/shop`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Terjadi kesalahan pada server saat membuat toko.",
        statusCode: error.response?.status || 500,
      }
    );
  }
};

/**
 * Mendapatkan detail toko milik pengguna yang sedang login.
 * @returns {Promise<Object>} Data detail toko atau error.
 */
const getMyShop = async () => {
  try {
    const response = await axios.get(`/api/shop/my-shop`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Terjadi kesalahan pada server saat mengambil data toko Anda.",
        statusCode: error.response?.status || 500,
      }
    );
  }
};

/**
 * Memperbarui detail toko milik pengguna yang sedang login.
 * @param {Object} updateData - Data untuk memperbarui toko.
 * @param {string} [updateData.shopName] - Nama baru untuk toko.
 * @param {string} [updateData.description] - Deskripsi baru untuk toko.
 * @param {string} [updateData.shopAddress] - Alamat baru untuk toko.
 * @param {File} [updateData.bannerImage] - File gambar baru untuk banner toko.
 * @param {boolean} [updateData.removeBannerImage] - Jika true, hapus banner toko saat ini.
 * @returns {Promise<Object>} Data toko yang telah diperbarui atau error.
 */
const updateMyShop = async (updateData) => {
  const formData = new FormData();

  if (updateData.shopName !== undefined) {
    formData.append("shopName", updateData.shopName);
  }
  if (updateData.description !== undefined) {
    formData.append("description", updateData.description);
  }
  if (updateData.shopAddress !== undefined) {
    formData.append("shopAddress", updateData.shopAddress);
  }
  if (updateData.bannerImage) {
    formData.append("bannerImage", updateData.bannerImage);
  }
  if (updateData.removeBannerImage === true) {
    formData.append("removeBannerImage", "true");
  }

  try {
    const response = await axios.put(`/api/shop/my-shop`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Terjadi kesalahan pada server saat memperbarui toko Anda.",
        statusCode: error.response?.status || 500,
      }
    );
  }
};

/**
 * Menghapus toko milik pengguna yang sedang login.
 * @returns {Promise<Object>} Pesan sukses atau error.
 */
const deleteMyShop = async () => {
  try {
    // Path untuk proxy, DELETE /api/shop/my-shop -> backend /shop/my-shop
    const response = await axios.delete(`/api/shop/my-shop`, {
      withCredentials: true, // Sertakan jika API Anda memerlukan cookies untuk autentikasi
    });
    return response.data; // { message: "Toko berhasil dihapus..." }
  } catch (error) {
    // Interceptor di AuthContext akan menangani 401 secara global.
    // Re-throw error untuk penanganan lebih lanjut di komponen.
    throw (
      error.response?.data || {
        success: false,
        message: "Terjadi kesalahan pada server saat menghapus toko Anda.",
        statusCode: error.response?.status || 500,
      }
    );
  }
};

export { createShop, getMyShop, updateMyShop, deleteMyShop }; 
