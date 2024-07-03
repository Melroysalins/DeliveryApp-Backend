import mongoose, { Schema } from "mongoose";

const reservationSchema = new mongoose.Schema({
  productID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Product", // Reference to the Product model
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User", // Reference to the User model
  },
  storeID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Store", // Reference to the Store model
  },
  quantity: {
    type: Number,
    required: true,
  },
  lockedUntil: {
    type: Date,
    required: true,
  },
  ispaymentdone: {
    type: Boolean,
    default: false,
  },
});
export const Reservation = mongoose.model("Reservation", reservationSchema);
