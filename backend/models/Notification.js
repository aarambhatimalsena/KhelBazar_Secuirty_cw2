import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // short text shown in notification list
    message: {
      type: String,
      required: true,
    },

    // type of notification
    type: {
      type: String,
      enum: [
        "order",
        "system",
        "promo",
        "review",
        "related",
        "new_arrival",
        "discount",
      ],
      default: "system",
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    // generic link to redirect user
    link: {
      type: String,
      default: "",
    },

    // optional product reference
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
