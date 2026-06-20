import api from "./api";

const userService = {
  getUsers: async () => {
    const response = await api.get("/api/users");
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/api/users/${id}`);
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post("/api/users", userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/api/users/${id}`, userData);
    return response.data;
  },
};

export default userService;
