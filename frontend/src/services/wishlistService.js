// src/services/wishlistService.js
import api from "../api/api";

const WISHLIST_KEY = "kalamkart_wishlist";

/* ---------------- GUEST MODE (localStorage) ---------------- */

export const getWishlist = () => {
  try {
    const stored = localStorage.getItem(WISHLIST_KEY);
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter((p) => p && p._id) : [];
  } catch {
    return [];
  }
};

// Guest: add full product object
export const addToWishlistGuest = (product) => {
  const current = getWishlist();
  if (!current.find((p) => p._id === product._id)) {
    const updated = [...current, product];
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("update-wishlist-count"));
  }
};

export const removeFromWishlistGuest = (productId) => {
  const updated = getWishlist().filter((p) => p._id !== productId);
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("update-wishlist-count"));
};

/* ---------------- LOGGED-IN USERS (backend) ---------------- */

// We ALWAYS return an array of PRODUCT OBJECTS here
export const getWishlistItems = async () => {
  try {
    const res = await api.get("/wishlist");
    const data = Array.isArray(res.data) ? res.data : [];

    // Backend might return:
    // 1) [{ product: {...}, _id: 'wishlistItemId' }]
    // 2) [{ ...productFields }]
    // 3) [{ product: 'productIdOnly' }]
    // We only keep entries where product is a real object with _id.
    const normalized = data
      .map((item) => (item.product && typeof item.product === "object" ? item.product : item))
      .filter((p) => p && typeof p === "object" && p._id);

    return normalized;
  } catch (error) {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      return getWishlist();
    }
    console.error("❌ Wishlist fetch failed", status);
    return [];
  }
};

// Logged-in: backend expects ARRAY of productIds (your current usage addToWishlist([id]))
export const addToWishlist = async (productIds) => {
  try {
    const res = await api.post("/wishlist", { productIds });
    return res.data;
  } catch (error) {
    const status = error?.response?.status;
    if (status === 401 || status === 403) return;
    throw error;
  }
};

// Logged-in remove (and local guest fallback)
export const removeFromWishlist = async (productId) => {
  try {
    const res = await api.delete(`/wishlist/${productId}`);
    return res.data;
  } catch (error) {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      removeFromWishlistGuest(productId);
      return;
    }
    throw error;
  }
};
