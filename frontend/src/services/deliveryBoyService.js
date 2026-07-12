import api from "./api";

const deliveryBoyService = {
  login: async (phone, password) => {
    const response = await api.post("/api/delivery/login", { phone, password });
    return response.data;
  },

  getAssignedOrders: async () => {
    const response = await api.get("/api/delivery/orders");
    return response.data;
  },

  getOrderDetails: async (orderNumber) => {
    const response = await api.get(`/api/delivery/orders/${orderNumber}`);
    return response.data;
  },

  sendDeliveryOtp: async (orderNumber) => {
    const response = await api.post(`/api/delivery/orders/${orderNumber}/send-otp`);
    return response.data;
  },

  updateOrderStatus: async (orderNumber, status, cancelReason = "", otp = "") => {
    const response = await api.put(`/api/delivery/orders/${orderNumber}/status`, {
      status,
      cancelReason,
      otp
    });
    return response.data;
  },

  updateAvailability: async (isAvailable) => {
    const response = await api.put("/api/delivery/availability", { isAvailable });
    return response.data;
  },

  // Admin CRUD actions for managing Delivery Boys
  adminGetDeliveryBoys: async () => {
    const response = await api.get("/api/delivery");
    return response.data;
  },

  adminCreateDeliveryBoy: async (boyData) => {
    const response = await api.post("/api/delivery/register", boyData);
    return response.data;
  },

  adminUpdateDeliveryBoy: async (id, boyData) => {
    const response = await api.put(`/api/delivery/${id}`, boyData);
    return response.data;
  },

  adminDeleteDeliveryBoy: async (id) => {
    const response = await api.delete(`/api/delivery/${id}`);
    return response.data;
  },
};

export default deliveryBoyService;
