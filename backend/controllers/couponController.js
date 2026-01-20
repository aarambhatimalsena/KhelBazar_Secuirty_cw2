import Coupon from '../models/Coupon.js';

// Create a new coupon (Admin only)
export const createCoupon = async (req, res) => {
  const { code, discountPercentage, expiresAt } = req.body;

  try {
    const existing = await Coupon.findOne({ code });
    if (existing) {
      return res.status(400).json({ message: 'Coupon already exists' });
    }

    const coupon = new Coupon({ code, discountPercentage, expiresAt });
    await coupon.save();
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create coupon', error: error.message });
  }
};

// Get and validate a coupon by code (User-side)
export const getCoupon = async (req, res) => {
  const { code } = req.params;

  try {
    const coupon = await Coupon.findOne({
      code,
      isActive: true,
      expiresAt: { $gte: new Date() }
    });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid or expired coupon' });
    }

    res.status(200).json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch coupon', error: error.message });
  }
};

// Delete a coupon (Admin only)
export const deleteCoupon = async (req, res) => {
  const { code } = req.params;

  try {
    const deleted = await Coupon.findOneAndDelete({ code });
    if (!deleted) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.status(200).json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete coupon', error: error.message });
  }
};

// Get all coupons (Admin)
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch coupons', error: error.message });
  }
};
