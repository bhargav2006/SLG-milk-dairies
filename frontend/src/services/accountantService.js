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

  assignDeliveryBoy: async (orderNumber, deliveryBoyId) => {
    const response = await api.put(`/api/accountant/orders/${orderNumber}/assign`, { deliveryBoyId });
    return response.data;
  },

  getAllDeliveryBoys: async () => {
    const response = await api.get("/api/accountant/delivery-boys");
    return response.data;
  },
};

export default accountantService;
