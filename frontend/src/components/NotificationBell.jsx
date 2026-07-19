import React, { useState, useRef, useEffect } from "react";
import { Bell, Check, BellOff } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";
import "./NotificationBell.css";

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusClass = (type) => {
    switch (type) {
      case "success":
        return "status-success";
      case "warning":
        return "status-warning";
      case "error":
        return "status-error";
      default:
        return "status-info";
    }
  };

  return (
    <div className="notif-bell-container" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`notif-bell-btn ${isOpen ? "active" : ""}`}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="notif-clear-btn">
                Mark all read
              </button>
            )}
          </div>

          <div className="notif-dropdown-body">
            {notifications.length === 0 ? (
              <div className="notif-empty">
                <BellOff size={36} className="notif-empty-icon" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id || Math.random()}
                  className={`notif-item ${notif.isRead ? "read" : "unread"}`}
                  onClick={() => !notif.isRead && markAsRead(notif._id)}
                >
                  <div className="notif-item-left">
                    <span className={`notif-status-dot ${getStatusClass(notif.type)}`} />
                  </div>
                  <div className="notif-item-content">
                    <div className="notif-item-title-row">
                      <span className="notif-title">{notif.title}</span>
                      <span className="notif-time">{formatTime(notif.at)}</span>
                    </div>
                    <p className="notif-msg">{notif.message}</p>
                  </div>
                  {!notif.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notif._id);
                      }}
                      className="notif-mark-read-btn"
                      title="Mark as read"
                    >
                      <Check size={12} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
