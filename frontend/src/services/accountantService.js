import api from "./api";

const accountantService = {
  getPendingOrders: async () => {
    const response = await api.get("/api/accountant/orders/pending");
    return response.data;
  },

  getAcceptedOrders: async () => {
    const response = await api.get("/api/accountant/orders/accepted");
    return response.data;
  },

  getAssignedOrders: async () => {
    const response = await api.get("/api/accountant/orders/assigned");
    return response.data;
  },

  acceptOrder: async (orderNumber) => {
    const response = await api.put(`/api/accountant/orders/${orderNumber}/accept`);
    return response.data;
  },

  assignDeliveryBoy: async (orderNumber, deliveryBoyId, isTemp = false, tempName = "", tempPhone = "") => {
    const response = await api.put(`/api/accountant/orders/${orderNumber}/assign`, {
      deliveryBoyId,
      isTemp,
      tempDeliveryBoyName: tempName,
      tempDeliveryBoyPhone: tempPhone
    });
    return response.data;
  },

  updateOrderStatus: async (orderNumber, status, cancelReason = "") => {
    const response = await api.put(`/api/accountant/orders/${orderNumber}/status`, {
      status,
      cancelReason
    });
    return response.data;
  },

  getPublicDeliveryDetails: async (orderNumber) => {
    const response = await api.get(`/api/orders/delivery-details/${orderNumber}`);
    return response.data;
  },

  getAllDeliveryBoys: async () => {
    const response = await api.get("/api/accountant/delivery-boys");
    return response.data;
  },
};

export default accountantService;
