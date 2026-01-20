import mongoose from "mongoose";

const trustedDeviceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    deviceHash: {
      type: String,
      required: true,
      index: true,
    },
    firstSeenAt: {
      type: Date,
      default: Date.now,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
    lastIp: {
      type: String,
      default: "",
    },
    lastCountry: {
      type: String,
      default: "",
    },
    lastCity: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
    browser: {
      type: String,
      default: "",
    },
    os: {
      type: String,
      default: "",
    },
    acceptLanguage: {
      type: String,
      default: "",
    },
    platform: {
      type: String,
      default: "",
    },
    revoked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

trustedDeviceSchema.index({ user: 1, deviceHash: 1 }, { unique: true });

const TrustedDevice = mongoose.model("TrustedDevice", trustedDeviceSchema);
export default TrustedDevice;
