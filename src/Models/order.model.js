import mongoose, { Schema } from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    storeID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },
    storeDetails: {
      type: Array,
    },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    userDetails: {
      type: Array,
    },
    productDetails: [],
    paymentDetails: {
      type: Array,
    },
    orderStatus: {
      type: String,
    },
    totalamount: {
      type: Number,
    },
  },

  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
