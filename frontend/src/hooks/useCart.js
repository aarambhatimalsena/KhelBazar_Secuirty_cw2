import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import {
  getCart as getBackendCart,
  addToCart as addBackend,
  removeFromCart as removeBackend,
  updateCartQuantity as updateBackendQty,
  clearCart as clearBackendCart,
} from "../services/cartService";

const CART_KEY = "cart";

const useCart = () => {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);

  const getLocalCart = () =>
    JSON.parse(localStorage.getItem(CART_KEY)) || [];

  const saveLocalCart = (items) => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("update-cart-count"));
  };

  const loadCart = async () => {
    if (isAuthenticated) {
      try {
        const data = await getBackendCart();
        setCartItems(data.items || []);
      } catch {
        setCartItems([]);
      }
    } else {
      setCartItems(getLocalCart());
    }
  };

  const addToCart = async (product, quantity = 1) => {
    if (isAuthenticated) {
      await addBackend(product._id, quantity);
      loadCart();
    } else {
      const cart = getLocalCart();
      const exists = cart.find((item) => item._id === product._id);
      if (exists) exists.quantity += quantity;
      else cart.push({ ...product, quantity });
      saveLocalCart(cart);
      setCartItems(cart);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (isAuthenticated) {
      await updateBackendQty(productId, quantity);
      loadCart();
    } else {
      const cart = getLocalCart();
      const updated = cart.map((item) =>
        item._id === productId ? { ...item, quantity } : item
      );
      saveLocalCart(updated);
      setCartItems(updated);
    }
  };

  const removeFromCart = async (id) => {
    if (isAuthenticated) {
      await removeBackend(id); // this is item._id in backend
      loadCart();
    } else {
      const updated = getLocalCart().filter((i) => i._id !== id);
      saveLocalCart(updated);
      setCartItems(updated);
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      await clearBackendCart();
      loadCart();
    } else {
      localStorage.removeItem(CART_KEY);
      setCartItems([]);
      window.dispatchEvent(new Event("update-cart-count"));
    }
  };

  useEffect(() => {
    loadCart();
  }, [isAuthenticated]);

  return {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    loadCart,
  };
};

export default useCart;
