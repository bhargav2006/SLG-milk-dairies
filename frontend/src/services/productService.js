import api from "./api";

const productService = {
  getProducts: async (params = {}) => {
    const response = await api.get("/api/products", { params });
    return response.data;
  },

  getProductById: async (id) => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await api.post("/api/products", productData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await api.put(`/api/products/${id}`, productData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/api/products/${id}`);
    return response.data;
  },

  getNextSerial: async (category) => {
    const response = await api.get("/api/products/next-serial", {
      params: { category }
    });
    return response.data;
  },
};

export default productService;
