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
};

export default userService;
