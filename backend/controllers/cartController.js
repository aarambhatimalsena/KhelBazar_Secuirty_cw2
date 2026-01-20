// controllers/cartController.js
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// Add item to cart or update quantity
export const addToCart = async (req, res) => {
  const userId = req.user._id;
  const { productId, quantity } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "❌ Product not found" });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = new Cart({ user: userId, items: [] });

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();

    const updatedCart = await Cart.findOne({ user: userId }).populate(
      "items.product"
    );

    res.status(200).json(updatedCart);
  } catch (error) {
    console.error("❌ ADD TO CART ERROR:", error);
    res.status(500).json({
      message: "❌ Failed to add to cart",
      error: error.message,
    });
  }
};

// Get current user's cart (filters deleted products)
export const getCart = async (req, res) => {
  const userId = req.user._id;

  try {
    let cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart) {
      return res.status(200).json({ user: userId, items: [] });
    }

    // filter out items whose product no longer exists
    cart.items = cart.items.filter((item) => item.product !== null);

    res.status(200).json({
      user: cart.user,
      items: cart.items.map((item) => ({
        _id: item._id,
        product: item.product,
        quantity: item.quantity,
      })),
    });
  } catch (error) {
    res.status(500).json({
      message: "❌ Failed to get cart",
      error: error.message,
    });
  }
};

// Update quantity of a specific cart item
export const updateCartItem = async (req, res) => {
  const userId = req.user._id;
  const { productId, quantity } = req.body;

  try {
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(
      (item) => item.product && item.product._id.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    item.quantity = quantity;
    await cart.save();

    const updatedCart = await Cart.findOne({ user: userId }).populate(
      "items.product"
    );
    res.status(200).json(updatedCart);
  } catch (error) {
    res.status(500).json({
      message: "❌ Failed to update cart item",
      error: error.message,
    });
  }
};

// Remove item from cart by item _id
export const removeFromCart = async (req, res) => {
  const userId = req.user._id;
  const itemId = req.params.itemId;

  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const initialCount = cart.items.length;
    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);

    if (cart.items.length === initialCount) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    await cart.save();

    const updatedCart = await Cart.findOne({ user: userId }).populate(
      "items.product"
    );
    res.status(200).json({
      message: "Item removed from cart successfully",
      cart: updatedCart,
    });
  } catch (error) {
    res.status(500).json({
      message: "❌ Failed to remove item",
      error: error.message,
    });
  }
};

// Clear the entire cart  ✅ (this was missing)
export const clearCart = async (req, res) => {
  const userId = req.user._id;

  try {
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      message: "🧹 Cart emptied successfully",
      cart: {
        user: cart.user,
        items: [],
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "❌ Failed to clear cart",
      error: error.message,
    });
  }
};
