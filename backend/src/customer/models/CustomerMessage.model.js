import mongoose from "mongoose";

const customerMessageSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
    },
    subject: {
      type: String,
      required: false, // Made optional for chat messages
    },
    message: {
      type: String,
      required: true,
    },
    // For backward compatibility and easier frontend access
    sender: {
      type: String,
      enum: ["user", "customer"],
      default: function () {
        return this.senderType || "customer";
      },
    },
    // Chat specific fields
    senderType: {
      type: String,
      enum: ["user", "customer"],
      required: false,
      default: "customer",
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    readBy: {
      type: [String],
      default: [],
    },
    type: {
      type: String,
      enum: ["general", "complaint", "dispute", "chat"],
      default: "chat",
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved"],
      default: "pending",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    reply: { type: String },
  },
  {
    timestamps: true,
  },
);

const CustomerMessage = mongoose.model(
  "CustomerMessage",
  customerMessageSchema,
);

export default CustomerMessage;
