import Wishlist from '../models/Wishlist.js';
import mongoose from 'mongoose'; // Required for ObjectId conversion

// ADD MULTIPLE PRODUCTS TO WISHLIST
export const addToWishlist = async (req, res) => {
  const userId = req.user._id;
  const { productIds } = req.body;

  if (!Array.isArray(productIds) || productIds.length === 0) {
    return res.status(400).json({ message: 'productIds must be a non-empty array' });
  }

  try {
    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, items: [] });
    }

    let addedCount = 0;

    productIds.forEach(pid => {
      const exists = wishlist.items.find(
        item => item.product && item.product.toString() === pid
      );

      if (!exists && mongoose.Types.ObjectId.isValid(pid)) {
        wishlist.items.push({ product: new mongoose.Types.ObjectId(pid) });
        addedCount++;
      }
    });

    await wishlist.save();

    res.status(201).json({
      message: `✅ ${addedCount} product(s) added to wishlist`
    });
  } catch (err) {
    res.status(500).json({ message: '❌ Server error', error: err.message });
  }
};

// GET WISHLIST (updated to return [] instead of 404)
export const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate('items.product', 'name price category image');

    if (!wishlist) {
      return res.status(200).json([]); // ✅ Fix: return empty array
    }

    res.status(200).json(wishlist.items);
  } catch (err) {
    res.status(500).json({ message: '❌ Server error', error: err.message });
  }
};

// REMOVE A PRODUCT FROM WISHLIST
export const removeFromWishlist = async (req, res) => {
  const { productId } = req.params;

  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    const filteredItems = wishlist.items.filter(
      item => item.product && item.product.toString() !== productId
    );

    wishlist.items = filteredItems;
    await wishlist.save();

    res.json({ message: '❌ Product removed from wishlist' });
  } catch (err) {
    res.status(500).json({ message: '❌ Server error', error: err.message });
  }
};
