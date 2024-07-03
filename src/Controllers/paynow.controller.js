import mongoose, { mongo } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { CART } from "../Models/cart.model.js";
import { Reservation } from "../Models/reservation.model.js";
import io from "socket.io-client";

const Paynow = asyncHandler(async (req, res) => {
  const { userID } = req.body;

  const session = await mongoose.startSession();

  try {
    let cart = await CART.findOne({ userID: userID });

    if (!cart || !cart.products.length) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).send({
        message: "cart is empty or no products found inside the cart",
      });
    }

    const now = new Date();
    const lockDuration = 10 * 60 * 1000; // 10 minutes in milliseconds
    const lockedUntil = new Date(now.getTime() + lockDuration);

    for (let cartitems of cart.products) {
      const productID = cartitems.productID;
      const requestedQuantity = cartitems.quantity;

      const product = await mongoose.connection.db
        .collection("products")
        .aggregate(
          [
            {
              $unwind: "$categoryname",
            },
            {
              $unwind: "$categoryname.product",
            },
            {
              $match: {
                "categoryname.product._id": new mongoose.Types.ObjectId(
                  productID
                ),
                "categoryname.product.quantity": { $gte: requestedQuantity },
              },
            },
          ],
          { session }
        )
        .toArray();

      if (!product || !product.length) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).send({
          message: "No products found",
        });
      }

      const productToUpdate = product[0];

      const reservation = new Reservation({
        productID: productID,
        userID: userID,
        quantity: requestedQuantity,
        storeID: productToUpdate.storeID,
        lockedUntil: lockedUntil,
      });

      await reservation.save({ session });

      const updateProduct = await mongoose.connection.db
        .collection("products")
        .aggregate([
          {
            "categoryname.product._id": new mongoose.Types.ObjectId(productID),
          },
          {
            $inc: {
              "categoryname.$[].product.$[p].quantity": -requestedQuantity,
            },
          },
          {
            arrayFilters: [{ "p._id": new mongoose.Types.ObjectId(productID) }],
            session,
          },
        ]);
    }
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.log("Error while setting up the lock", error);
  }
});

const DeleteReservation = asyncHandler(async (req, res) => {
  try {
    const { userID } = req.body;

    let reservation = await Reservation.deleteMany({ userID: userID });

    return res.status(200).send({
      message: "document deleted",
    });
  } catch (error) {
    console.log("Error while deleting reservation", error);
  }
});

const connectionWithSToreandUser = asyncHandler(async (req, res) => {});

const mergecartwithRegisterUser = asyncHandler(async (req, res) => {
  try {
    const { _id, userID } = req.body;

    let cartMerge = await CART.updateOne(
      {
        _id: _id,
      },
      {
        $set: { userID: userID },
      }
    );

    if (!cartMerge) {
      return res.status(400).send({
        status: 400,
        message: "Failed to merge cart items",
      });
    }

    return res.status(200).send({
      status: 200,
      message: "Cart Items has been merged successfully",
    });
  } catch (error) {
    console.log("Error while merging cart items", error);
  }
});

export {
  DeleteReservation,
  connectionWithSToreandUser,
  mergecartwithRegisterUser,
};
