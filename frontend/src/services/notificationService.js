// src/services/notificationService.js
import api from "../api/api";

// 📥 Get logged-in user's notifications
export const getMyNotifications = async () => {
  const res = await api.get("/notifications/my");
  // backend returns: { notifications: [...], unreadCount: number }
  return res.data;
};

// ✅ Mark one notification as read
export const markNotificationAsRead = async (id) => {
  const res = await api.patch(`/notifications/${id}/read`);
  return res.data;
};

// ✅ Mark ALL notifications as read
export const markAllNotificationsAsRead = async () => {
  const res = await api.patch("/notifications/read-all");
  return res.data;
};

// 🗑️ Delete one notification
export const deleteNotification = async (id) => {
  const res = await api.delete(`/notifications/${id}`);
  return res.data;
};

// 🗑️ (optional) Delete ALL notifications
export const deleteAllNotifications = async () => {
  const res = await api.delete("/notifications/all");
  return res.data;
};
