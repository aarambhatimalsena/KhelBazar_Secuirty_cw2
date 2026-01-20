import asyncHandler from "express-async-handler";
import Notification from "../models/Notification.js";

/**
 * Helper: create a notification from other controllers
 */
export const createNotification = async ({
  userId,
  message,
  type = "order",
  link = "",
}) => {
  if (!userId || !message) {
    console.error("❌ createNotification called without userId/message");
    return;
  }

  try {
    await Notification.create({
      user: userId,
      message,
      type,
      link,
    });
  } catch (err) {
    console.error("❌ Failed to create notification:", err.message);
  }
};

// GET /api/notifications/my  (protected)
export const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .limit(30);

  const unreadCount = await Notification.countDocuments({
    user: req.user.id,
    isRead: false,
  });

  res.json({
    notifications,
    unreadCount,
  });
});

// PATCH /api/notifications/:id/read
export const markNotificationAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  if (!notification.isRead) {
    notification.isRead = true;
    await notification.save();
  }

  res.json({ success: true });
});

// PATCH /api/notifications/read-all
export const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user.id, isRead: false },
    { $set: { isRead: true } }
  );

  res.json({ success: true });
});

// DELETE /api/notifications/:id
export const deleteNotification = asyncHandler(async (req, res) => {
  const deleted = await Notification.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!deleted) {
    res.status(404);
    throw new Error("Notification not found");
  }

  res.json({ success: true, message: "Notification deleted" });
});

// DELETE /api/notifications/all
export const deleteAllNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ user: req.user.id });

  res.json({
    success: true,
    message: "All notifications deleted",
  });
});
