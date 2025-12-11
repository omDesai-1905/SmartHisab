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
      required: true 
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userEmail: { 
      type: String, 
      required: true 
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
    },
    subject: { 
      type: String, 
      required: true 
    },
    message: { 
      type: String, 
      required: true 
    },
    type: {
      type: String,
      enum: ["general", "complaint", "dispute"],
      default: "general",
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved"],
      default: "pending",
    },
    reply: { type: String },
  },
  {
    timestamps: true,
  }
);

const CustomerMessage = mongoose.model(
  "CustomerMessage",
  customerMessageSchema
);

export default CustomerMessage;
