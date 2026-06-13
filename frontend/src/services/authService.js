import api from "./api";

const authService = {
  login: async (email, password) => {
    const response = await api.post("/api/auth/login", { email, password });
    return response.data;
  },

  register: async (name, email, password, role) => {
    const response = await api.post("/api/auth/register", { name, email, password, role });
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get("/api/users/profile");
    return response.data;
  },
};

export default authService;
