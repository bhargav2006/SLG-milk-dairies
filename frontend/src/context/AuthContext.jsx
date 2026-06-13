import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import authService from "../services/authService";
import { registerLogoutHandler } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("dairy_token"));
  const [loading, setLoading] = useState(true);

  // Logout method
  const logout = useCallback(() => {
    localStorage.removeItem("dairy_token");
    setToken(null);
    setUser(null);
    setLoading(false);
  }, []);

  // Login method
  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      localStorage.setItem("dairy_token", data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (error) {
      logout();
      throw error;
    }
  };

  // Register method
  const register = async (name, email, password, role) => {
    try {
      const data = await authService.register(name, email, password, role);
      localStorage.setItem("dairy_token", data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (error) {
      logout();
      throw error;
    }
  };

  // Check user status on load
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem("dairy_token");
      if (savedToken) {
        try {
          const profile = await authService.getProfile();
          setUser(profile.user);
        } catch (error) {
          console.error("Token verification failed:", error);
          logout();
        }
      } else {
        logout();
      }
      setLoading(false);
    };

    initAuth();
  }, [logout]);

  // Connect Axios 401 interceptor to this logout handler
  useEffect(() => {
    registerLogoutHandler(logout);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
