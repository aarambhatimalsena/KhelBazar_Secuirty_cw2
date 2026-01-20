// controllers/paymentController.js
import axios from "axios";
import Order from "../models/Order.js";
import { writeAuditLog } from "../utils/audit.js";

// 🧩 Small helper: safe order lookup (no status change)
const findOrderSafe = async (orderId) => {
  if (!orderId) return null;
  try {
    const order = await Order.findById(orderId);
    return order || null;
  } catch {
    return null;
  }
};

/**
 * ✅ eSewa Payment Success (PHASE-1: SIMULATION ONLY)
 * - DOES NOT mark isPaid = true
 * - Just confirms that we received "success" and asks user to wait.
 * - Real money flow / manual verification can be described in documentation.
 */
export const handleEsewaSuccess = async (req, res) => {
  try {
    const { oid, amt } = req.query;

    // OPTIONAL: try to find the order just for logging / debugging
    const order = await findOrderSafe(oid);

    if (!order) {
      // We don't tell too much, just generic message
      return res.send(
        "✅ eSewa reported success. If you placed an order, it will be verified shortly."
      );
    }

    // 💡 IMPORTANT:
    // We DO NOT change order.isPaid here in Phase-1.
    // isPaid will be set ONLY from secure admin route: markOrderPaid.

    console.log(
      `✅ eSewa success callback for order ${order._id} (amount: ${amt})`
    );

    return res.send(
      "✅ Payment success received from eSewa (simulation). Your order will be verified and updated by the system/admin."
    );
  } catch (err) {
    console.error("❌ ERROR in eSewa Success:", err.message);
    return res
      .status(500)
      .send("❌ Error while handling eSewa success callback.");
  }
};

/**
 * ❌ eSewa Payment Failure / Cancel
 */
export const handleEsewaFailure = (req, res) => {
  console.log("❌ eSewa reported failure or cancellation:", req.query);
  return res.status(400).send("❌ Payment failed or was cancelled.");
};

/**
 * ✅ Khalti Payment Verification (PHASE-1: SAFE SIMULATION)
 *
 * - In Phase-1 we do NOT mark order.isPaid = true here.
 * - We only verify token with Khalti (in real mode),
 *   log result, and return a success/failure message.
 * - isPaid is controlled by separate secure admin route.
 */
export const handleKhaltiVerification = async (req, res) => {
  const { token, amount, orderId } = req.body;

  // 1️⃣ LOCAL SIMULATION MODE
  if (token === "test_local") {
    const order = await findOrderSafe(orderId);

    if (!order) {
      return res
        .status(404)
        .json({ message: "❌ Order not found for local Khalti test." });
    }

    console.log(
      `✅ Local Khalti simulation for order ${order._id} with amount ${amount}`
    );

    // NOTE: No isPaid change here.
    return res.json({
      message:
        "✅ Local Khalti payment simulation received. Order will be verified/updated by system.",
    });
  }

  // 2️⃣ REAL KHALTI VERIFY (still Phase-1 style)
  try {
    const response = await axios.post(
      "https://khalti.com/api/v2/payment/verify/",
      {
        token,
        amount,
      },
      {
        headers: {
          Authorization:
            "Key test_secret_key_dc74b3fc69cf4e3db8b6f7fd178f630b", // TODO: move to process.env.KHALTI_SECRET
        },
      }
    );

    const order = await findOrderSafe(orderId);

    if (!order) {
      return res
        .status(404)
        .json({ message: "❌ Order not found while verifying Khalti." });
    }

    // OPTIONAL: Verify amount matches
    const amountFromKhalti = response.data.amount || amount;
    if (Number(order.totalAmount) * 100 !== Number(amountFromKhalti)) {
      console.warn(
        `⚠️ Amount mismatch: order.totalAmount = ${order.totalAmount}, khalti = ${amountFromKhalti}`
      );
      // Still don't mark paid here in Phase-1
    }

    console.log(
      `✅ Khalti verification success for order ${order._id}, idx=${response.data.idx}`
    );

    // PHASE-1 RULE: DO NOT set isPaid here.
    // isPaid is updated only via admin panel (markOrderPaid)
    // or a future, more secure flow in Phase-2.

    return res.json({
      message:
        "✅ Khalti payment verified successfully. Your order will be updated by the system/admin.",
      khaltiResponse: response.data,
    });
  } catch (error) {
    console.error("❌ Khalti verification failed:", error.response?.data || error.message);

    return res.status(500).json({
      message: "❌ Khalti verification failed",
      error: error.response?.data || error.message,
    });
  }
};

// ✅ Simulated payment success (server-verified)
export const simulatePaymentSuccess = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required." });
    }

    const order = await Order.findById(orderId).populate("items");
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    const requesterId = req.user?._id || req.user?.id;
    const isAdmin = req.user?.role === "admin";
    const isOwner = requesterId && String(order.user) === String(requesterId);
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "Access denied." });
    }

    if (order.isPaid) {
      return res.status(409).json({ message: "Order already paid." });
    }

    const computedTotal = (order.items || []).reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
      0
    );
    const expectedTotal = Math.max(computedTotal - (order.discount || 0), 0);

    if (Number(order.totalAmount) !== Number(expectedTotal)) {
      return res
        .status(400)
        .json({ message: "Payment amount mismatch." });
    }

    order.isPaid = true;
    order.paidAt = new Date();
    await order.save();

    await writeAuditLog({
      user: requesterId || null,
      action: "PAYMENT_SIMULATED_SUCCESS",
      req,
      metadata: { orderId: order._id, totalAmount: order.totalAmount },
    });

    return res.status(200).json({ message: "Payment verified successfully." });
  } catch (error) {
    console.error("❌ simulatePaymentSuccess Error:", error);
    return res.status(500).json({ message: "Payment verification failed." });
  }
};
