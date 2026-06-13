import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);

    // Auto dismiss after 3.5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
  }, []);

  const showSuccess = useCallback((msg) => addToast(msg, "success"), [addToast]);
  const showError = useCallback((msg) => addToast(msg, "danger"), [addToast]);
  const showWarning = useCallback((msg) => addToast(msg, "warning"), [addToast]);
  const showInfo = useCallback((msg) => addToast(msg, "info"), [addToast]);

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="toast-icon" size={18} color="#22C55E" />;
      case "danger":
        return <XCircle className="toast-icon" size={18} color="#EF4444" />;
      case "warning":
        return <AlertTriangle className="toast-icon" size={18} color="#F59E0B" />;
      default:
        return <Info className="toast-icon" size={18} color="#4A90E2" />;
    }
  };

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showWarning, showInfo, removeToast }}>
      {children}
      <div className="toast-container no-print">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            {getIcon(toast.type)}
            <span style={{ flexGrow: 1 }}>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: "#9CA3AF",
                display: "flex",
                alignItems: "center",
                marginLeft: "8px"
              }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
