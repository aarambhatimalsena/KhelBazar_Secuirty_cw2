import api from "../api/api";

export const addToCart = async (productId, quantity = 1) => {
  const res = await api.post("/cart", { productId, quantity });
  window.dispatchEvent(new Event("update-cart-count"));
  return res.data;
};

export const getCart = async () => {
  const res = await api.get("/cart");
  return res.data;
};

export const updateCartQuantity = async (productId, quantity) => {
  const res = await api.put("/cart/item", { productId, quantity });
  window.dispatchEvent(new Event("update-cart-count"));
  return res.data;
};

export const removeFromCart = async (itemId) => {
  const res = await api.delete(`/cart/item/${itemId}`);
  window.dispatchEvent(new Event("update-cart-count"));
  return res.data;
};

export const clearCart = async () => {
  const res = await api.delete("/cart");
  window.dispatchEvent(new Event("update-cart-count"));
  return res.data;
};
