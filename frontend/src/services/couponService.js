import api from "./api";

const couponService = {
  getCoupons: async () => {
    const response = await api.get("/api/coupons");
    return response.data.coupons;
  },

  getCouponById: async (id) => {
    const response = await api.get(`/api/coupons/${id}`);
    return response.data.coupon;
  },

  createCoupon: async (couponData) => {
    const response = await api.post("/api/coupons", couponData);
    return response.data;
  },

  updateCoupon: async (id, couponData) => {
    const response = await api.put(`/api/coupons/${id}`, couponData);
    return response.data;
  },

  deleteCoupon: async (id) => {
    const response = await api.delete(`/api/coupons/${id}`);
    return response.data;
  },

  validateCoupon: async (code, subtotal) => {
    const response = await api.post("/api/coupons/validate", { code, subtotal });
    return response.data;
  },
};

export default couponService;
