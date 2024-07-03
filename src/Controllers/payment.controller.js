import mongoose from "mongoose";
import { CART } from "../Models/cart.model.js";
import { Order } from "../Models/order.model.js";
import { Reservation } from "../Models/reservation.model.js";
import { instance } from "../index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import crypto from "crypto";

const { ObjectId } = mongoose.Types;

const checkout = asyncHandler(async (req, res) => {
  try {
    const {
      amount,
      userID,
      storeID,
      products,
      totalprice,
      storeinfo,
      userInfo,
    } = req.body;

    const options = {
      amount: Number(amount * 100), // amount in the smallest currency unit
      currency: "INR",
      notes: {
        userID,
        storeID,
        products: JSON.stringify(products),
        totalprice,
        storeinfo,
        userInfo,
      },
    };
    const orders = await instance.orders.create(options);

    return res.status(200).send({
      status: 200,
      orders,
    });
  } catch (error) {
    console.log("Error while doing payment", error);
    return res.status(500).send({
      status: 500,
      message: "Internal Server Error",
    });
  }
});

const paymentVerification = async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
    req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    const order = await instance.orders.fetch(razorpay_order_id);
    const { userID, storeID, products, totalprice, storeinfo, userInfo } =
      order.notes;

    const storeOrderDetails = new Order({
      userID: userID,
      storeID: storeID,
      productDetails: JSON.parse(products),
      paymentDetails: {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
      },
      totalamount: totalprice,
      orderStatus: "pending",
      storeDetails: storeinfo,
      userDetails: userInfo,
    });

    await storeOrderDetails.save();

    res.redirect(
      `http://localhost:3001/payment/reference/${razorpay_payment_id}`
    );

    await CART.findOneAndDelete({ userID: userID });
    await Reservation.deleteMany({ userID: userID });
  } else {
    return res.status(400).json({
      success: false,
      message: "Payment verification failed",
    });
  }
};

export const returnrazorkey = async (req, res) => {
  console.log(process.env.RAZORPAY_API_KEY);
  return res.status(200).send({
    key: process.env.RAZORPAY_API_KEY,
  });
};

const OrderDetailsSave = asyncHandler(async (req, res) => {
  try {
    const { userID } = req.body;

    // let orderDetails = await Order.find({ userID: userID });

    let orderDetails = await mongoose.connection.db
      .collection("orders")
      .aggregate([
        {
          $match: { userID: new ObjectId(userID) },
        },
        {
          $sort: { createdAt: -1 }, // Sort by createdAt in descending order
        },
      ])
      .toArray();

    if (!orderDetails) {
      return res.status(200).send({
        status: 200,
        orderDetails,
      });
    }

    return res.status(200).send({
      status: 200,
      orderDetails,
    });
  } catch (error) {
    console.log("Error while fetching order details", error);
  }
});

export { checkout, paymentVerification, OrderDetailsSave };
