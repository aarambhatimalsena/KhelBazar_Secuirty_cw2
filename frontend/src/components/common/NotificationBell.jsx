// src/components/common/NotificationBell.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaCheckCircle } from "react-icons/fa";
import { FiLoader } from "react-icons/fi";
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../../services/notificationService";
import { useAuth } from "../../auth/AuthProvider";
import toast from "react-hot-toast";

const ThinBellIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#444"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

const NotificationBell = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState(null);

  const dropdownRef = useRef(null);

  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  // 🔁 API call (handle backend shape: { notifications, unreadCount })
  const fetchNotifications = async () => {
    try {
      setError(null);
      if (open) setLoading(true);

      const data = await getMyNotifications();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.notifications)
        ? data.notifications
        : [];

      setNotifications(list);

      // unreadCount from backend if available, else calculate
      const backendUnread =
        !Array.isArray(data) && typeof data?.unreadCount === "number"
          ? data.unreadCount
          : list.filter((n) => !n.isRead).length;

      setUnreadCount(backendUnread);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError("Failed to load notifications");
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      if (open) setLoading(false);
    }
  };

  // 1️⃣ dropdown open हुँदा load
  useEffect(() => {
    if (open && isAuthenticated) {
      fetchNotifications();
    }
  }, [open, isAuthenticated]);

  // 2️⃣ LOGIN हुँदा + "refresh-notifications" event सुन्दा load
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // initial load → bell counter
    fetchNotifications();

    const handler = () => {
      fetchNotifications();
    };

    window.addEventListener("refresh-notifications", handler);
    return () => window.removeEventListener("refresh-notifications", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // बाहिर क्लिक गर्दा close
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const toggleDropdown = () => setOpen((prev) => !prev);

  const recomputeUnread = (list) => {
    const safe = Array.isArray(list) ? list : [];
    setUnreadCount(safe.filter((n) => !n.isRead).length);
  };

  const handleItemClick = async (notification) => {
    try {
      if (!notification.isRead) {
        const updated = (Array.isArray(notifications) ? notifications : []).map(
          (n) =>
            n._id === notification._id ? { ...n, isRead: true } : n
        );
        setNotifications(updated);
        recomputeUnread(updated);
        await markNotificationAsRead(notification._id);
      }

      if (notification.link) {
        navigate(notification.link);
        setOpen(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not update notification.");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      if (unreadCount === 0) return;

      setMarkingAll(true);
      await markAllNotificationsAsRead();

      const updated = (Array.isArray(notifications) ? notifications : []).map(
        (n) => ({ ...n, isRead: true })
      );
      setNotifications(updated);
      setUnreadCount(0);

      toast.success("All notifications marked as read");

      // अन्य component हरू sync गर्न
      window.dispatchEvent(new Event("refresh-notifications"));
    } catch (err) {
      console.error(err);
      toast.error("Could not mark all as read");
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const updated = (Array.isArray(notifications) ? notifications : []).filter(
        (n) => n._id !== id
      );
      setNotifications(updated);
      recomputeUnread(updated);

      await deleteNotification(id);
      toast.success("Notification deleted");

      window.dispatchEvent(new Event("refresh-notifications"));
    } catch (err) {
      console.error(err);
      toast.error("Could not delete notification");
    }
  };

  const formatTime = (date) => {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("en-US", {
      hour12: true,
      hour: "numeric",
      minute: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const TypeBadge = ({ type }) => {
    if (!type) return null;
    let label = String(type).replace("_", " ");
    label = label.charAt(0).toUpperCase() + label.slice(1);
    return (
      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px]">
        {label}
      </span>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 🔔 Bell button */}
      <button
        type="button"
        onClick={toggleDropdown}
        className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
        aria-label="Notifications"
      >
        <ThinBellIcon className="w-5 h-5" />

        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-teal-700 text-white text-[10px] flex items-center justify-center font-semibold px-[5px]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* 🔽 Dropdown */}
      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Notifications
              </p>
              <p className="text-xs text-gray-500">
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : "You're all caught up 👌"}
              </p>
            </div>

            <button
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0 || markingAll}
              className={`text-[11px] flex items-center gap-1 px-2 py-1 rounded-full border ${
                unreadCount === 0 || markingAll
                  ? "border-gray-200 text-gray-300 cursor-not-allowed"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              } transition`}
            >
              {markingAll && <FiLoader className="w-3 h-3 animate-spin" />}
              <FaCheckCircle className="w-3 h-3" />
              Mark all read
            </button>
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto">
            {!isAuthenticated ? (
              <div className="p-4 text-sm text-gray-500">
                Please sign in to view notifications.
              </div>
            ) : loading ? (
              <div className="p-4 text-sm text-gray-500 flex items-center gap-2">
                <FiLoader className="animate-spin" /> Loading...
              </div>
            ) : error ? (
              <div className="p-4 text-sm text-red-500">{error}</div>
            ) : safeNotifications.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">
                No notifications yet.
              </div>
            ) : (
              safeNotifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleItemClick(n)}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-gray-50 hover:bg-gray-50 ${
                    !n.isRead ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <div className="pt-[6px]">
                    {!n.isRead ? (
                      <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <TypeBadge type={n.type} />
                      <span className="text-[10px] text-gray-400">
                        {formatTime(n.createdAt)}
                      </span>
                    </div>

                    <p className="text-[13px] mt-1 text-gray-800">
                      {n.message}
                    </p>

                    {n.link && (
                      <span className="text-[11px] text-blue-600 underline mt-1 block">
                        View details
                      </span>
                    )}
                  </div>

                  <button
                    className="text-gray-300 hover:text-teal-700 mt-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(n._id);
                    }}
                    aria-label="Delete notification"
                  >
                    <FaTrash className="w-3 h-3" />
                  </button>
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

