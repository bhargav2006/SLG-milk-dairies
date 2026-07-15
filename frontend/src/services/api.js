import axios from "axios";

let base = import.meta.env.VITE_BACKEND_URI;

if (
  base &&
  base.includes("localhost") &&
  typeof window !== "undefined" &&
  window.location &&
  window.location.hostname &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
) {
  base = base.replace("localhost", window.location.hostname);
}

const api = axios.create({
  baseURL: base,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: add bearer token if it exists
api.interceptors.request.use(
  (config) => {
    // If the request targets customer routes, use the customer token
    if (
      config.url.startsWith("/api/orders") ||
      config.url.startsWith("/api/customer/profile")
    ) {
      const customerToken = localStorage.getItem("customer_token");
      if (customerToken) {
        config.headers.Authorization = `Bearer ${customerToken}`;
        return config;
      }
    }
    // If the request targets delivery boy routes, use the delivery token
    if (config.url.startsWith("/api/delivery")) {
      const deliveryToken = localStorage.getItem("delivery_token");
      if (deliveryToken) {
        config.headers.Authorization = `Bearer ${deliveryToken}`;
        return config;
      }
    }
    const token = localStorage.getItem("dairy_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor: handle token expiration / auth errors
let logoutUserHandler = null;

export const registerLogoutHandler = (handler) => {
  logoutUserHandler = handler;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;

    if (status === 401) {
      console.warn("Unauthorized request detected (401). Signing out user.");
      if (logoutUserHandler) {
        logoutUserHandler();
      }
    }

    return Promise.reject(error);
  },
);

export default api;
