// controllers/orderController.js
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import crypto from "crypto";

import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import Cart from "../models/Cart.js";
import Coupon from "../models/Coupon.js";

import { generateInvoice } from "../utils/invoiceGenerator.js";
import { sendOrderEmail } from "../utils/emailSender.js";
import { createNotification } from "./notificationController.js";
import { writeAuditLog } from "../utils/audit.js";
import { sanitizeText } from "../utils/sanitize.js";
import { encryptField, decryptField } from "../utils/cryptoField.js";

// =============================
// 🔐 Helpers: order integrity
// =============================

const computeIntegrityHash = ({
  userId,
  items,
  totalAmount,
  couponCode,
  discountAmount,
}) => {
  const secret =
    process.env.ORDER_INTEGRITY_SECRET || "fallback_order_integrity_secret";

  // sorted by productId for deterministic hash
  const sortedItems = [...items].sort((a, b) =>
    a.productId.localeCompare(b.productId)
  );

  const payload = JSON.stringify({
    userId: String(userId),
    items: sortedItems.map((i) => ({
      productId: String(i.productId),
      quantity: i.quantity,
      price: i.price,
    })),
    totalAmount,
    couponCode: couponCode || null,
    discountAmount: discountAmount || 0,
  });

  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
};

const buildItemsForIntegrityFromOrder = (order) => {
  return (order.items || []).map((item) => ({
    productId: item.product
      ? item.product._id
        ? item.product._id.toString()
        : item.product.toString()
      : null,
    quantity: item.quantity,
    price: item.price,
  }));
};

const verifyOrderIntegrityOrWarn = async (order) => {
  // For older orders without hash → skip check
  if (!order.integrityHash) return { ok: true, reason: "no_hash" };

  const itemsForHash = buildItemsForIntegrityFromOrder(order);

  const expectedHash = computeIntegrityHash({
    userId: order.user._id ? order.user._id.toString() : order.user.toString(),
    items: itemsForHash,
    totalAmount: order.totalAmount,
    couponCode: order.couponCode,
    discountAmount: order.discount,
  });

  if (expectedHash !== order.integrityHash) {
    console.error(
      "⚠️ Order integrity mismatch detected for order:",
      order._id.toString()
    );
    return { ok: false, reason: "mismatch" };
  }

  return { ok: true, reason: "match" };
};

// =============================
// dY"? Helpers: payment signature
// =============================
const stableStringify = (value) => {
  if (Array.isArray(value)) {
    return `[${value.map((v) => stableStringify(v)).join(",")}]`;
  }

  if (value && typeof value === "object") {
    const keys = Object.keys(value).sort();
    const props = keys.map(
      (k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`
    );
    return `{${props.join(",")}}`;
  }

  return JSON.stringify(value);
};

const computePaymentSignature = (payload) => {
  const secret = process.env.PAYMENT_SIGNING_SECRET;
  if (!secret) {
    throw new Error("PAYMENT_SIGNING_SECRET is not set");
  }

  return crypto
    .createHmac("sha256", secret)
    .update(stableStringify(payload))
    .digest("hex");
};

const verifyPaymentSignature = (signature, payload) => {
  if (!signature) return { ok: false, reason: "missing_signature" };

  const expected = computePaymentSignature(payload);
  const expectedBuf = Buffer.from(expected, "hex");
  const providedBuf = Buffer.from(String(signature), "hex");

  if (expectedBuf.length !== providedBuf.length) {
    return { ok: false, reason: "length_mismatch" };
  }

  const match = crypto.timingSafeEqual(expectedBuf, providedBuf);
  return match ? { ok: true } : { ok: false, reason: "mismatch" };
};

// =============================
// dY"? Helpers: decrypt delivery address for authorized users
// =============================
const applyDecryptedDeliveryAddress = async (order, req, context) => {
  if (!order || !order.deliveryAddress) return;

  const result = decryptField(order.deliveryAddress);
  if (!result.ok) {
    await writeAuditLog({
      user: req.user?._id || req.user?.id || null,
      action: "FIELD_DECRYPT_FAILED",
      req,
      metadata: { field: "deliveryAddress", context, error: result.error },
    });
    order.deliveryAddress = "[unavailable]";
    return;
  }

  order.deliveryAddress = result.value;
};

// =============================
// 📦 PLACE ORDER
// =============================
export const placeOrder = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const userEmail = req.user.email;
    const userName = req.user.name;

    const ip = req.ip;
    const userAgent = req.headers["user-agent"];

    console.log("📦 placeOrder called for user:", userId);
    console.log("📦 Request body:", req.body);

    // 1) Get cart with products
    const cart = await Cart.findOne({
      user: new mongoose.Types.ObjectId(userId),
    }).populate({
      path: "items.product",
      model: "Product",
    });

    if (!cart || cart.items.length === 0) {
      console.log("🛒 Cart empty for user:", userId);
      return res.status(400).json({ message: "Your cart is empty" });
    }

    // 2) Body fields (extra safety; main validation is in validateOrder)
    const { deliveryAddress, phone, paymentMethod, couponCode } = req.body;
    const {
      value: cleanAddress,
      modified: addressModified,
    } = sanitizeText(deliveryAddress, 300);

    if (!cleanAddress || !phone) {
      return res
        .status(400)
        .json({ message: "Delivery address and phone are required" });
    }

    if (addressModified) {
      await writeAuditLog({
        user: userId,
        action: "XSS_BLOCKED",
        req,
        metadata: { field: "deliveryAddress", route: "place_order" },
      });
    }

    const clientTotal =
      req.body.totalAmount ??
      req.body.total ??
      req.body.finalTotal ??
      req.body.totalPrice;
    const clientDiscount = req.body.discountAmount ?? req.body.discount;

    const signaturePayload = {
      deliveryAddress: cleanAddress,
      phone,
      paymentMethod: paymentMethod || null,
      couponCode: couponCode || null,
      clientTotal: clientTotal ?? null,
      clientDiscount: clientDiscount ?? null,
    };

    // Payment signature removed for frontend-less signing

    // 3) Normalize items snapshot for integrity + order items
    const normalizedItems = cart.items
      .filter((item) => item.product)
      .map((item) => ({
        productId: item.product._id.toString(),
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
      }));

    if (normalizedItems.length === 0) {
      return res.status(400).json({ message: "No valid products in cart" });
    }

    // 4) Calculate total (SERVER-SIDE ONLY) – client-sent totals are ignored
    let totalAmount = normalizedItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    let discountAmount = 0;

    // 5) Apply coupon if provided
    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode,
        isActive: true,
        expiresAt: { $gte: new Date() },
      });

      if (!coupon) {
        return res
          .status(400)
          .json({ message: "Invalid or expired coupon code" });
      }

      discountAmount = (totalAmount * coupon.discountPercentage) / 100;
      totalAmount -= discountAmount;
    }

    if (
      (clientTotal !== undefined &&
        clientTotal !== null &&
        Number(clientTotal) !== Number(totalAmount)) ||
      (clientDiscount !== undefined &&
        clientDiscount !== null &&
        Number(clientDiscount) !== Number(discountAmount))
    ) {
      await writeAuditLog({
        user: userId,
        action: "PAYMENT_TAMPERING_DETECTED",
        req,
        metadata: {
          clientTotal,
          serverTotal: totalAmount,
          clientDiscount,
          serverDiscount: discountAmount,
          couponCode: couponCode || null,
        },
      });

      return res
        .status(400)
        .json({ message: "Payment data mismatch detected." });
    }

    // 6) Compute integrity hash (anti-price tampering)
    const integrityHash = computeIntegrityHash({
      userId,
      items: normalizedItems,
      totalAmount,
      couponCode,
      discountAmount,
    });

    let encryptedAddress;
    try {
      encryptedAddress = encryptField(cleanAddress);
    } catch (err) {
      await writeAuditLog({
        user: userId,
        action: "FIELD_ENCRYPT_FAILED",
        req,
        metadata: { field: "deliveryAddress", error: err.message },
      });
      return res.status(500).json({ message: "Failed to secure address." });
    }

    // 7) Create base order
    const newOrder = new Order({
      user: userId,
      items: [],
      deliveryAddress: encryptedAddress,
      phone,
      totalAmount,
      paymentMethod: paymentMethod || "COD",
      isPaid: false,
      couponCode: couponCode || null,
      discount: discountAmount || 0,
      integrityHash,
      createdIp: ip || null,
      createdUserAgent: userAgent || null,
    });

    const savedOrder = await newOrder.save();
    console.log("✅ Order created:", savedOrder._id);

    // 8) Create order items
    const orderItemIds = [];
    for (const item of normalizedItems) {
      const orderItem = new OrderItem({
        order: savedOrder._id,
        product: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      });

      const savedItem = await orderItem.save();
      orderItemIds.push(savedItem._id);
    }

    savedOrder.items = orderItemIds;
    await savedOrder.save();
    console.log("✅ Order items attached");

    // 9) Clear cart
    await Cart.findOneAndDelete({
      user: new mongoose.Types.ObjectId(userId),
    });
    console.log("🧺 Cart cleared for user:", userId);

    // 🔔 Notification
    try {
      await createNotification({
        userId,
        message: `Your order #${savedOrder._id} has been placed successfully 🎉`,
        type: "order",
        link: `/orders/${savedOrder._id}`,
      });
      console.log("🔔 Order notification created for user:", userId);
    } catch (notifErr) {
      console.error("⚠️ Failed to create order notification:", notifErr);
    }

    // 10) Respond to client
    res.status(201).json({
      message: "✅ Order placed successfully!",
      orderId: savedOrder._id,
      totalAmount,
      discount: discountAmount,
      couponCode: couponCode || null,
      createdAt: savedOrder.createdAt,
      updatedAt: savedOrder.updatedAt,
    });

    // 11) Invoice + email async (non-blocking)
    try {
      const invoicePath = path.resolve(`invoices/invoice-${savedOrder._id}.pdf`);
      if (!fs.existsSync("invoices")) {
        fs.mkdirSync("invoices", { recursive: true });
      }

      const fullOrder = await Order.findById(savedOrder._id)
        .populate("user", "name email")
        .populate({
          path: "items",
          populate: {
            path: "product",
            model: "Product",
          },
        });

      await applyDecryptedDeliveryAddress(fullOrder, req, "place_order_invoice");

      await generateInvoice(fullOrder, invoicePath);

      await sendOrderEmail(
        userEmail,
        "🧾 Your KhelBazar Order Invoice",
        `Dear ${userName},\n\nThanks for your order! Please find the invoice attached.\n\nRegards,\nKhelBazar`,
        invoicePath
      );

      fs.unlink(invoicePath, () => {});
      console.log("📧 Invoice generated & email sent:", savedOrder._id);
    } catch (invoiceErr) {
      console.error(
        "⚠️ Invoice/email error (order already placed, ignoring for client):",
        invoiceErr
      );
    }
  } catch (err) {
    console.error("❌ placeOrder fatal error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================
// 📄 DOWNLOAD INVOICE (IDOR-safe: returns 404)
// =============================
export const downloadInvoice = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const requesterId = req.user.id || req.user._id;
    const requesterRole = req.user.role;

    // ✅ prevent cast error + ID enumeration
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = await Order.findById(orderId)
      .populate("user", "name email")
      .populate({
        path: "items",
        populate: {
          path: "product",
          model: "Product",
        },
      });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ✅ Only owner or admin can download invoice
    const isOwner = order.user._id.toString() === requesterId.toString();
    const isAdmin = requesterRole === "admin";

    // ✅ Return 404 to hide existence (prevents IDOR enumeration)
    if (!isOwner && !isAdmin) {
      await writeAuditLog({
        user: requesterId,
        action: "IDOR_ATTEMPT",
        req,
        metadata: {
          resource: "order_invoice",
          orderId,
          ownerId: order.user?._id || order.user,
        },
      });

      return res.status(404).json({ message: "Order not found" });
    }

    await applyDecryptedDeliveryAddress(order, req, "download_invoice");

    const invoicePath = path.resolve(`invoices/invoice-${order._id}.pdf`);
    const dir = path.dirname(invoicePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    await generateInvoice(order, invoicePath);

    res.download(invoicePath, (err) => {
      if (err) {
        console.error("❌ Error sending invoice:", err);
        return res.status(500).json({ message: "Failed to download invoice" });
      }
    });
  } catch (err) {
    console.error("❌ downloadInvoice error:", err);
    res.status(500).json({ message: "Invoice error" });
  }
};

// =============================
// 👤 GET USER ORDERS
// =============================
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const orders = await Order.find({ user: userId })
      .populate({
        path: "items",
        populate: {
          path: "product",
          model: "Product",
        },
      })
      .sort({ createdAt: -1 });

    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    for (const order of orders) {
      await applyDecryptedDeliveryAddress(order, req, "get_user_orders");
    }

    for (const order of orders) {
      await applyDecryptedDeliveryAddress(order, req, "get_all_orders_admin");
    }

    res.status(200).json(orders);
  } catch (err) {
    console.error("❌ getUserOrders error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ USER: GET ONE ORDER BY ID (IDOR-safe: 404 if not owned)
export const getOrderByIdForUser = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const orderId = req.params.id;

    // ✅ prevent cast error + enumeration noise
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ✅ ownership enforced at query-level
    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate("user", "name email")
      .populate({
        path: "items",
        populate: {
          path: "product",
          model: "Product",
        },
      });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await applyDecryptedDeliveryAddress(order, req, "get_order_by_id_user");

    res.status(200).json(order);
  } catch (err) {
    console.error("❌ getOrderByIdForUser error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================
// 🛡️ ADMIN: GET ALL ORDERS
// =============================
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate({
        path: "items",
        populate: {
          path: "product",
          model: "Product",
        },
      });

    res.status(200).json(orders);
  } catch (err) {
    console.error("❌ getAllOrders error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================
// 🛡️ ADMIN: GET ONE ORDER DETAIL
// =============================
export const getOrderByIdAdmin = async (req, res) => {
  try {
    const orderId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = await Order.findById(orderId)
      .populate("user", "name email")
      .populate({
        path: "items",
        populate: {
          path: "product",
          model: "Product",
        },
      });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await applyDecryptedDeliveryAddress(order, req, "get_order_by_id_admin");

    // Optional: integrity check, just for logging (not blocking)
    try {
      const integrityResult = await verifyOrderIntegrityOrWarn(order);
      if (!integrityResult.ok) {
        console.warn(
          "⚠️ Admin view: integrity mismatch for order",
          order._id.toString()
        );
      }
    } catch (e) {
      console.warn("⚠️ Integrity check failed (admin view):", e.message);
    }

    res.status(200).json(order);
  } catch (err) {
    console.error("❌ getOrderByIdAdmin error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================
// 🛡️ ADMIN: UPDATE ORDER STATUS
// =============================
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const validStatuses = ["Processing", "Shipped", "Delivered", "Cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = await Order.findById(orderId)
      .populate("user", "name email")
      .populate({
        path: "items",
        populate: {
          path: "product",
          model: "Product",
        },
      });

    if (!order) return res.status(404).json({ message: "Order not found" });

    // (Optional) integrity check before admin update
    const integrityResult = await verifyOrderIntegrityOrWarn(order);
    if (!integrityResult.ok) {
      return res.status(409).json({
        message:
          "Order data appears to be tampered. Please contact security/admin.",
      });
    }

    order.status = status;
    await order.save();

    res.status(200).json({ message: "Order status updated", order });
  } catch (err) {
    console.error("❌ updateOrderStatus error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================
// 🛡️ ADMIN: MARK ORDER AS PAID
// =============================
export const markOrderPaid = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = await Order.findById(orderId)
      .populate("user", "name email")
      .populate({
        path: "items",
        populate: {
          path: "product",
          model: "Product",
        },
      });

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.isPaid) {
      return res
        .status(400)
        .json({ message: "Order is already marked as paid." });
    }

    // ✅ Integrity check before confirming payment
    const integrityResult = await verifyOrderIntegrityOrWarn(order);
    if (!integrityResult.ok) {
      return res.status(409).json({
        message:
          "Order data appears to be tampered. Payment not processed. Please investigate.",
      });
    }

    order.isPaid = true;
    order.paymentMethod = order.paymentMethod || "COD";
    await order.save();

    await applyDecryptedDeliveryAddress(order, req, "mark_order_paid");

    const invoicePath = path.resolve(`invoices/invoice-${order._id}.pdf`);
    if (!fs.existsSync("invoices"))
      fs.mkdirSync("invoices", { recursive: true });

    await generateInvoice(order, invoicePath);

    await sendOrderEmail(
      order.user.email,
      "🧾 Updated Invoice - Payment Confirmed",
      `Dear ${order.user.name},\n\nYour payment has been confirmed. Please find the updated invoice attached.\n\nThank you,\nKhelBazar`,
      invoicePath
    );

    fs.unlink(invoicePath, () => {});

    res.status(200).json({
      message: "✅ Order marked as paid and updated invoice emailed.",
      order,
    });
  } catch (err) {
    console.error("❌ markOrderPaid error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
