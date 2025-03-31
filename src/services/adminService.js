import axios from "axios";

const API_URL = "https://backend.main-tech.site";

// Setup axios interceptors for admin requests
const adminAxios = axios.create({
  baseURL: API_URL,
});

// Add token to requests
adminAxios.interceptors.request.use(
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

// Register admin
export const adminRegister = async (username, email, password) => {
  try {
    // Mengirim permintaan ke endpoint API register admin
    const response = await axios.post(`${API_URL}/api/admin/register`, {
      username,
      email,
      password,
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      const errorMsg = error.response.data.message || error.response.data.error;
      throw new Error(errorMsg || "Pendaftaran admin gagal");
    }
    throw new Error("Tidak dapat terhubung ke server");
  }
};

// Login admin
export const adminLogin = async (identifier, password) => {
  try {
    // Mengirim permintaan ke endpoint API login admin
    const response = await axios.post(`${API_URL}/api/admin/login`, {
      identifier,
      password,
    });

    // Simpan token dan admin data ke localStorage
    if (response.data.token) {
      localStorage.setItem("adminToken", response.data.token);
      localStorage.setItem("adminData", JSON.stringify(response.data.admin));
    }

    return response.data;
  } catch (error) {
    if (error.response) {
      const errorMsg = error.response.data.message || error.response.data.error;
      throw new Error(errorMsg || "Login admin gagal");
    }
    throw new Error("Tidak dapat terhubung ke server");
  }
};

// Logout admin
export const adminLogout = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminData");
};

// Check if admin is authenticated
export const isAdminAuthenticated = () => {
  return !!localStorage.getItem("adminToken");
};

// Get admin profile
export const getAdminProfile = async () => {
  try {
    const response = await adminAxios.get(`${API_URL}/api/admin/profile`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid, logout
      adminLogout();
    }
    throw error;
  }
};

// Update admin profile
export const updateAdminProfile = async (profileData) => {
  try {
    const response = await adminAxios.put(`/admin/profile`, profileData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get dashboard statistics
export const getDashboardStats = async () => {
  try {
    const response = await adminAxios.get(`/admin/dashboard/stats`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get list of all products
export const getAllProducts = async () => {
  try {
    const response = await adminAxios.get(`/admin/products`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create new product
export const createProduct = async (productData) => {
  try {
    const response = await adminAxios.post(`/admin/products`, productData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update product
export const updateProduct = async (productId, productData) => {
  try {
    const response = await adminAxios.put(
      `/admin/products/${productId}`,
      productData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete product
export const deleteProduct = async (productId) => {
  try {
    const response = await adminAxios.delete(`/admin/products/${productId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get all orders
export const getAllOrders = async (page = 1, limit = 10, status = null) => {
  try {
    let url = `/admin/orders?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }
    const response = await adminAxios.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get order detail
export const getOrderDetail = async (orderId) => {
  try {
    const response = await adminAxios.get(`/admin/orders/${orderId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (orderId, status, notes = "") => {
  try {
    const response = await adminAxios.put(`/admin/orders/${orderId}/status`, {
      status,
      notes,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get all users
export const getAllUsers = async (page = 1, limit = 10) => {
  try {
    const response = await adminAxios.get(
      `/admin/users?page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get user detail
export const getUserDetail = async (userId) => {
  try {
    const response = await adminAxios.get(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update user status (active/inactive)
export const updateUserStatus = async (userId, isActive) => {
  try {
    const response = await adminAxios.put(`/admin/users/${userId}/status`, {
      isActive,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Generate reports
export const generateSalesReport = async (
  startDate,
  endDate,
  type = "daily"
) => {
  try {
    const response = await adminAxios.get(`/admin/reports/sales`, {
      params: {
        startDate,
        endDate,
        type, // daily, weekly, monthly
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get product inventory
export const getInventory = async () => {
  try {
    const response = await adminAxios.get(`/admin/inventory`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update product inventory
export const updateInventory = async (productId, stock) => {
  try {
    const response = await adminAxios.put(`/admin/inventory/${productId}`, {
      stock,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Export all admin service functions
const adminService = {
  adminRegister,
  adminLogin,
  adminLogout,
  isAdminAuthenticated,
  getAdminProfile,
  updateAdminProfile,
  getDashboardStats,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  getOrderDetail,
  updateOrderStatus,
  getAllUsers,
  getUserDetail,
  updateUserStatus,
  generateSalesReport,
  getInventory,
  updateInventory,
};

export default adminService;
