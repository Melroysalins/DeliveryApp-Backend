import mongoose, { Schema } from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    storeDetails: {
      storeID: {
        type: Schema.Types.ObjectId,
        ref: "stores",
      },
      type: Array,
    },
    products: [
      {
        productID: {
          type: Schema.Types.ObjectId,
          ref: "products",
        },
        productname: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number, // changed to Number type for consistency in price handling
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

export const CART = mongoose.model("CART", cartSchema);
