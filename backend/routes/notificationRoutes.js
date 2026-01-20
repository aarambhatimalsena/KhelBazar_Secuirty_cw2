import express from "express";
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "../controllers/notificationController.js";

import { protect } from "../middleware/authMiddleware.js";
import { requireCsrf } from "../middleware/csrfMiddleware.js";

const router = express.Router();

// ======================
// NOTIFICATION ROUTES
// ======================

// ✅ GET = read-only → CSRF not needed
router.get("/my", protect, getMyNotifications);

// ✅ PATCH/DELETE = state-changing → CSRF required
router.patch("/read-all", protect, requireCsrf, markAllNotificationsAsRead);
router.patch("/:id/read", protect, requireCsrf, markNotificationAsRead);

router.delete("/all", protect, requireCsrf, deleteAllNotifications);
router.delete("/:id", protect, requireCsrf, deleteNotification);

export default router;
