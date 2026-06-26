import api from "./api";

const billService = {
  getBills: async (params = {}) => {
    const response = await api.get("/api/bill", { params });
    return response.data;
  },

  getBillById: async (id) => {
    const response = await api.get(`/api/bill/${id}`);
    return response.data;
  },

  getBillsByCustomer: async (customerNumber) => {
    const response = await api.get(`/api/bill/customer/${customerNumber}`);
    return response.data;
  },

  getBillsByAccountant: async (accountantId, params = {}) => {
    const response = await api.get(`/api/bill/accountant/${accountantId}`, { params });
    return response.data;
  },

  createBill: async (billData) => {
    const response = await api.post("/api/bill", billData);
    return response.data;
  },

  updateBill: async (invoiceNumber, billData) => {
    const response = await api.put(`/api/bill/${invoiceNumber}`, billData);
    return response.data;
  },

  deleteBill: async (invoiceNumber) => {
    const response = await api.delete(`/api/bill/${invoiceNumber}`);
    return response.data;
  },
};

export default billService;
