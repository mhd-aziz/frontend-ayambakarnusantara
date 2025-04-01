// src/services/api.js
import axios from "axios";
import { API_URL } from "../utils/constants";

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API methods
const apiService = {
  // Product APIs
  getProducts: async (params = {}) => {
    const token = localStorage.getItem("token");
    const endpoint = token ? "/api/user/products" : "/api/products";

    try {
      const response = await api.get(endpoint, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  getProductById: async (id) => {
    try {
      const response = await api.get(`/api/product/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product with id ${id}:`, error);
      throw error;
    }
  },

  getProductStock: async (id) => {
    try {
      const response = await api.get(`/api/product/${id}/stock`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching stock for product with id ${id}:`, error);
      throw error;
    }
  },

  // Cart APIs
  addToCart: async (productId, quantity) => {
    try {
      const response = await api.post("/api/user/cart/add", {
        productId,
        quantity,
      });
      return response.data;
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  },

  getCart: async () => {
    try {
      const response = await api.get("/api/user/cart");
      return response.data;
    } catch (error) {
      console.error("Error fetching cart:", error);
      throw error;
    }
  },

  updateCartItem: async (cartItemId, quantity) => {
    try {
      const response = await api.put(`/api/user/cart/${cartItemId}`, {
        quantity,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating cart item:", error);
      throw error;
    }
  },

  removeCartItem: async (cartItemId) => {
    try {
      const response = await api.delete(`/api/user/cart/${cartItemId}`);
      return response.data;
    } catch (error) {
      console.error("Error removing cart item:", error);
      throw error;
    }
  },

  clearCart: async () => {
    try {
      const response = await api.delete("/api/user/cart/clear");
      return response.data;
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw error;
    }
  },

  createOrder: async () => {
    try {
      const response = await api.post("/api/user/orders");
      return response.data;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  },
  getClientKey: async () => {
    try {
      const response = await api.get("/api/payment/client-key");
      return response.data;
    } catch (error) {
      console.error("Error fetching Midtrans client key:", error);
      throw error;
    }
  },
  getUserOrders: async () => {
    try {
      const response = await api.get("/api/user/orders");
      return response.data;
    } catch (error) {
      console.error("Error fetching user orders:", error);
      throw error;
    }
  },
  getOrderById: async (orderId) => {
    try {
      const response = await api.get(`/api/user/order/${orderId}`);
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching order details for order ${orderId}:`,
        error
      );
      throw error;
    }
  },
  getPaymentStatus: async (orderId) => {
    try {
      const response = await api.get(
        `/api/user/order/${orderId}/payment-status`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching payment status for order ${orderId}:`,
        error
      );
      throw error;
    }
  },

  // Get Product Ratings API
  getProductRatings: async (productId, params = {}) => {
    try {
      const response = await api.get(`/api/product/${productId}/ratings`, {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          sort: params.sort || "newest",
        },
      });
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching ratings for product with id ${productId}:`,
        error
      );
      throw error;
    }
  },

  createOrUpdateRating: async (productId, value, comment) => {
    try {
      const response = await api.post("/api/user/rating", {
        productId,
        value,
        comment,
      });
      return response.data;
    } catch (error) {
      console.error("Error creating or updating rating:", error);
      throw error;
    }
  },

  getShops: async (params = {}) => {
    try {
      const response = await api.get("/api/user/shops", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching shops:", error);
      throw error;
    }
  },

  getShopById: async (id) => {
    try {
      const response = await api.get(`/api/user/shop/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching shop with id ${id}:`, error);
      throw error;
    }
  },
  getShopRatings: async (shopId) => {
    try {
      const response = await api.get(`/api/shop/${shopId}/ratings`);
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching ratings for shop with id ${shopId}:`,
        error
      );
      throw error;
    }
  },
};

export default apiService;
