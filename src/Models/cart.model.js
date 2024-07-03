import mongoose, { Schema } from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    userID: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    storeDetails: [
      {
        storeID: {
          type: Schema.Types.ObjectId,
          ref: "stores",
        },
        storename: {
          type: String,
        },
        address: {
          type: Array,
        },
        offer: {
          type: String,
        },
        file: {
          public_id: {
            type: String,
          },
          url: {
            type: String,
          },
        },
      },
    ],
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
        increment: {
          type: Boolean,
          default: true,
        },
        price: {
          type: Number, // changed to Number type for consistency in price handling
          required: true,
        },
        image: {
          public_id: {
            type: String,
          },
          url: {
            type: String,
          },
        },
      },
    ],
    offerapplied: {
      type: Boolean,
      default: false,
    },
    totalprice: {
      type: Number,
    },
    originalprice: {
      type: Number,
    },
  },
  { timestamps: true }
);

export const CART = mongoose.model("CART", cartSchema);
