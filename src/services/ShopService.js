// src/services/ShopService.js
import axios from "axios";

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

const deleteMyShop = async () => {
  try {
    const response = await axios.delete(`/api/shop/my-shop`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Terjadi kesalahan pada server saat menghapus toko Anda.",
        statusCode: error.response?.status || 500,
      }
    );
  }
};

const getAllShops = async () => {
  try {
    const response = await axios.get(`/api/shop`);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Terjadi kesalahan pada server saat mengambil daftar toko.",
        statusCode: error.response?.status || 500,
      }
    );
  }
};

const getShopDetailById = async (shopId) => {
  if (!shopId) {
    throw new Error("shopId tidak boleh kosong.");
  }
  try {
    const response = await axios.get(`/api/shop/${shopId}/detail`);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Terjadi kesalahan pada server saat mengambil detail toko.",
        statusCode: error.response?.status || 500,
      }
    );
  }
};

export {
  createShop,
  getMyShop,
  updateMyShop,
  deleteMyShop,
  getAllShops,
  getShopDetailById,
};
