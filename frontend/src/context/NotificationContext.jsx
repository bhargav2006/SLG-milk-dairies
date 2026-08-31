import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
import api from "../services/api";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user, token: staffToken } = useAuth();
  const { showInfo } = useToast();
  const [customerToken, setCustomerToken] = useState(() => localStorage.getItem("customer_token"));
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Sync customer token when localStorage changes
  const syncCustomerToken = useCallback(() => {
    const token = localStorage.getItem("customer_token");
    setCustomerToken(token);
  }, []);

  // Fetch initial notifications list
  const fetchNotifications = useCallback(async () => {
    const activeStaffToken = localStorage.getItem("dairy_token") || staffToken;
    const activeCustomerToken = localStorage.getItem("customer_token") || customerToken;

    try {
      if (activeStaffToken && user) {
        const response = await api.get("/api/notifications/staff");
        const list = response.data.notifications || [];
        setNotifications(list);
        setUnreadCount(list.filter((n) => !n.isRead).length);
      } else if (activeCustomerToken) {
        const response = await api.get("/api/notifications/customer");
        const list = response.data.notifications || [];
        setNotifications(list);
        setUnreadCount(list.filter((n) => !n.isRead).length);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error fetching notifications list:", error);
    }
  }, [staffToken, customerToken, user]);

  // Mark single notification as read
  const markAsRead = useCallback(async (id) => {
    const activeStaffToken = localStorage.getItem("dairy_token") || staffToken;
    const activeCustomerToken = localStorage.getItem("customer_token") || customerToken;

    try {
      if (activeStaffToken && user) {
        await api.put(`/api/notifications/staff/${id}/read`);
      } else if (activeCustomerToken) {
        await api.put(`/api/notifications/customer/${id}/read`);
      }
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }, [staffToken, customerToken, user]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    const activeStaffToken = localStorage.getItem("dairy_token") || staffToken;
    const activeCustomerToken = localStorage.getItem("customer_token") || customerToken;

    try {
      if (activeStaffToken && user) {
        await api.put("/api/notifications/staff/read-all");
      } else if (activeCustomerToken) {
        await api.put("/api/notifications/customer/read-all");
      }
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }, [staffToken, customerToken, user]);

  // Fetch list on auth state change & periodic polling (every 30 seconds)
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
        setCustomerToken,
        syncCustomerToken,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};
