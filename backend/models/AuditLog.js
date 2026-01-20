import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    action: { type: String, required: true, trim: true, index: true },
    ipAddress: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true } // createdAt + updatedAt
);

export default mongoose.model("AuditLog", auditLogSchema);
