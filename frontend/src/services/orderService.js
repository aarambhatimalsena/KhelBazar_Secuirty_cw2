// src/services/orderService.js
import api from "../api/api";

// =======================
// USER: ORDER APIs
// =======================

// Place a new order (user)
export const placeOrder = async (orderData) => {
  // backend: POST /orders/place
  const res = await api.post("/orders/place", orderData);
  return res.data;
};

// Simulate payment success for online methods
export const simulatePaymentSuccess = async ({ orderId }) => {
  const res = await api.post("/payments/simulate-success", { orderId });
  return res.data;
};

// Get logged-in user's orders
export const getUserOrders = async () => {
  // backend: GET /orders/my-orders
  const res = await api.get("/orders/my-orders");
  return res.data;
};

// Get a single order by ID (for the logged-in user)
export const getOrderByIdUser = async (orderId) => {
  // backend: GET /orders/my-orders/:id
  const res = await api.get(`/orders/my-orders/${orderId}`, {
    withCredentials: true, // only needed if you're using cookie-based auth
  });
  return res.data;
};

// Download invoice for an order (user or admin)
export const downloadInvoice = async (orderId) => {
  // backend: GET /orders/invoice/:orderId
  const res = await api.get(`/orders/invoice/${orderId}`, {
    responseType: "blob", // important for PDF download
  });
  return res;
};

// =======================
// ADMIN: ORDER MANAGEMENT
// =======================

// Get all orders (admin)
export const getAllOrders = async () => {
  // backend: GET /orders/admin/all
  const res = await api.get("/orders/admin/all");
  return res.data;
};

// Get a single order by ID (admin detail page)
export const getOrderById = async (orderId) => {
  // backend: GET /orders/admin/:id
  const res = await api.get(`/orders/admin/${orderId}`);
  return res.data;
};

// Update order status (admin)
export const updateOrderStatus = async ({ orderId, status }) => {
  // backend: PUT /orders/admin/status
  const res = await api.put("/orders/admin/status", { orderId, status });
  return res.data;
};

// Mark order as paid (admin)
export const markOrderPaid = async ({ orderId }) => {
  // backend: PUT /orders/admin/mark-paid
  const res = await api.put("/orders/admin/mark-paid", { orderId });
  return res.data;
};
