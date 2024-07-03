import mongoose, { Schema } from "mongoose";

const TransactionSchema = new mongoose.Schema({
  userID: mongoose.Schema.Types.ObjectId,
  productID: mongoose.Schema.Types.ObjectId,
  quantity: Number,
  createdAt: { type: Date, default: Date.now },
  lockedUntil: Date, // Lock expiration time
});

export const Transaction = mongoose.model("Transaction", TransactionSchema);
