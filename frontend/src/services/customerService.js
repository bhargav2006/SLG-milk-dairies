import api from "./api";

const customerService = {
  // Fetch public storefront products
  getShopProducts: async (params = {}) => {
    const response = await api.get("/api/shop/products", { params });
    return response.data;
  },

  // Send login OTP to customer mobile number
  sendOtp: async (customerPhone) => {
    const response = await api.post("/api/customer/send-otp", {
      customerPhone,
    });
    return response.data;
  },

  // Verify OTP and sign in customer
  verifyOtp: async (customerPhone, customerName, otp) => {
    const response = await api.post("/api/customer/verify-otp", {
      customerPhone,
      customerName,
      otp,
    });
    return response.data;
  },

  // Fetch logged in customer's profile info
  getProfile: async () => {
    const response = await api.get("/api/customer/profile");
    return response.data;
  },

  // Place a new order
  placeOrder: async (orderData) => {
    const response = await api.post("/api/orders", orderData);
    return response.data;
  },

  // Get current customer's order history
  getMyOrders: async () => {
    const response = await api.get("/api/orders");
    return response.data;
  },

  // Cancel an order (if Placed)
  cancelOrder: async (orderNumber, reason) => {
    const response = await api.put(`/api/orders/${orderNumber}/cancel`, {
      reason,
    });
    return response.data;
  },
};

export default customerService;
