import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    address: {
      type: Array,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    orderhistory: {
      type: Array,
      default: null,
    },
    email: {
      type: String,
      required: true,
    },
  },

  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
