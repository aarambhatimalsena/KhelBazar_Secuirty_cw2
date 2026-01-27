import api from "../api/api";

// Get admin dashboard stats
export const getAdminStats = async () => {
  const res = await api.get("/admin/stats");
  return res.data;
};

// Get all users (admin)
export const getAllUsers = async () => {
  const res = await api.get("/admin/users");
  return res.data;
};

// Delete user (admin)
export const deleteUser = async (userId) => {
  const res = await api.delete(`/admin/users/${userId}`);
  return res.data;
};

// Update user role (admin)
export const updateUserRole = async ({ userId, role }) => {
  const res = await api.put(`/admin/users/${userId}`, { role });
  return res.data;
};

// Force logout user (admin)
export const forceLogoutUser = async (userId) => {
  const res = await api.post(`/admin/users/${userId}/force-logout`);
  return res.data;
};

// Get audit logs (admin)
export const getAuditLogs = async (params = {}) => {
  const res = await api.get("/admin/audit-logs", { params });
  return res.data;
};

export const getAuditActions = async () => {
  const res = await api.get("/admin/audit-actions");
  return res.data;
};
