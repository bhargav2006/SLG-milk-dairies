import api from "./api";

const branchService = {
  // Get all branches
  getBranches: async (activeOnly = false) => {
    const response = await api.get(`/api/branches${activeOnly ? "?activeOnly=true" : ""}`);
    return response.data;
  },

  // Get single branch
  getBranchById: async (id) => {
    const response = await api.get(`/api/branches/${id}`);
    return response.data;
  },

  // Create new branch
  createBranch: async (branchData) => {
    const response = await api.post("/api/branches", branchData);
    return response.data;
  },

  // Update branch
  updateBranch: async (id, branchData) => {
    const response = await api.put(`/api/branches/${id}`, branchData);
    return response.data;
  },

  // Delete/Deactivate branch
  deleteBranch: async (id) => {
    const response = await api.delete(`/api/branches/${id}`);
    return response.data;
  },
};

export default branchService;
