import api from "./api";

const billService = {
  getBills: async () => {
    const response = await api.get("/api/bill");
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

  getBillsByAccountant: async (accountantId) => {
    const response = await api.get(`/api/bill/accountant/${accountantId}`);
    return response.data;
  },

  createBill: async (billData) => {
    const response = await api.post("/api/bill", billData);
    return response.data;
  },
};

export default billService;
