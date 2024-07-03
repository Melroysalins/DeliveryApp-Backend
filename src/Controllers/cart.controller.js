import { CART } from "../Models/cart.model.js";
import { Reservation } from "../Models/reservation.model.js";
import { Restaurant } from "../Models/restaurantList.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

// const addItemToCart = asyncHandler(async (req, res) => {
//   try {
//     const { storeID, _id, userID } = req.body;

//     const session = await mongoose.startSession();

//     session.startTransaction();

//     const objectId = new mongoose.Types.ObjectId(storeID);
//     const productId = new mongoose.Types.ObjectId(_id);

//     const product = await Restaurant.findOne({
//       "restaurantlist.storeID": objectId,
//     });

//     if (!product) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).send({
//         message: "Invalid product credential",
//       });
//     }

//     const storeInfo = product.restaurantlist.find((store) =>
//       store.storeID.equals(objectId)
//     );

//     let cart = await CART.findOne({ userID: userID }).session(session);

//     if (cart) {
//       const existingStore = cart.storeDetails.find((store) =>
//         store?.storeID.equals(objectId)
//       );

//       if (existingStore) {
//         const cartitem = await mongoose.connection.db
//           .collection("products")
//           .aggregate([
//             { $unwind: "$categoryname" },
//             { $unwind: "$categoryname.product" },
//             { $match: { "categoryname.product._id": productId } },
//           ])
//           .toArray();

//         if (cartitem.length > 0) {
//           const item = cartitem[0];
//           const originalPrice = item.categoryname.product.price;

//           const productInCart = cart.products.find(
//             (ele) => ele.productID.toString() === productId.toString()
//           );

//           if (productInCart) {
//             const newQuantity = productInCart.quantity + 1;
//             const newPrice = originalPrice * newQuantity;

//             if (item?.categoryname?.product.quantity < newQuantity) {
//               productInCart.increment = false;

//               await session.abortTransaction();
//               session.endSession();

//               return res.status(406).send({
//                 status: 406,
//                 message:
//                   "You've added the maximum quantity available for this item",
//               });
//             }

//             productInCart.quantity = newQuantity;
//             productInCart.price = newPrice;

//             // Recalculate total price
//             cart.totalprice = cart.products.reduce(
//               (total, product) => total + product.price,
//               0
//             );

//             await cart.save({ session });

//             await session.commitTransaction();
//             session.endSession();

//             return res.status(200).send({
//               status: 200,
//               message: "Item successfully added",
//             });
//           } else {
//             cart.products.push({
//               productID: item.categoryname.product._id,
//               productname: item.categoryname.product.productname,
//               quantity: 1,
//               price: originalPrice,
//             });

//             // Recalculate total price
//             cart.totalprice = cart.products.reduce(
//               (total, product) => total + product.price,
//               0
//             );

//             await cart.save({ session });

//             await session.commitTransaction();
//             session.endSession();

//             return res.status(200).send({
//               status: 200,
//               message: "Item successfully added",
//             });
//           }
//         }
//       } else {
//         await session.abortTransaction();
//         session.endSession();
//         return res.status(200).send({
//           status: 201,
//           message: "Your cart contains items from another restaurant",
//         });
//       }
//     } else {
//       const cartitem = await mongoose.connection.db
//         .collection("products")
//         .aggregate([
//           { $unwind: "$categoryname" },
//           { $unwind: "$categoryname.product" },
//           { $match: { "categoryname.product._id": productId } },
//         ])
//         .toArray();

//       if (cartitem.length > 0) {
//         const item = cartitem[0];

//         cart = new CART({
//           userID: userID,
//           storeDetails: [storeInfo],
//           products: [
//             {
//               productID: item.categoryname.product._id,
//               productname: item.categoryname.product.productname,
//               quantity: 1,
//               price: item.categoryname.product.price,
//             },
//           ],
//           totalprice: item.categoryname.product.price,
//         });

//         await cart.save({ session });

//         await session.commitTransaction();
//         session.endSession();

//         return res.status(200).send({
//           status: 200,
//           message: "Item successfully added",
//         });
//       }
//     }
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     console.log("Error while adding product to cart", error);
//     return res.status(500).send({
//       status: 500,
//       message: "An error occurred while adding the item to the cart",
//     });
//   }
// });

const addItemToCart = asyncHandler(async (req, res) => {
  const { storeID, _id, userID } = req.body;
  const objectId = new mongoose.Types.ObjectId(storeID);
  const productId = new mongoose.Types.ObjectId(_id);

  const MAX_RETRIES = 3;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const product = await Restaurant.findOne({
        "restaurantlist.storeID": objectId,
      }).session(session);

      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).send({
          message: "Invalid product credential",
        });
      }

      const storeInfo = product.restaurantlist.find((store) =>
        store.storeID.equals(objectId)
      );

      let cart = await CART.findOne({ userID: userID }).session(session);

      if (cart) {
        const existingStore = cart.storeDetails.find((store) =>
          store?.storeID.equals(objectId)
        );

        if (existingStore) {
          const cartitem = await mongoose.connection.db
            .collection("products")
            .aggregate([
              { $unwind: "$categoryname" },
              { $unwind: "$categoryname.product" },
              { $match: { "categoryname.product._id": productId } },
            ])
            .toArray();

          if (cartitem.length > 0) {
            const item = cartitem[0];
            const originalPrice = item.categoryname.product.price;

            const productInCart = cart.products.find(
              (ele) => ele.productID.toString() === productId.toString()
            );

            if (productInCart) {
              const newQuantity = productInCart.quantity + 1;
              const newPrice = originalPrice * newQuantity;

              if (item?.categoryname?.product.quantity < newQuantity) {
                productInCart.increment = false;

                await session.abortTransaction();
                session.endSession();

                return res.status(406).send({
                  status: 406,
                  message:
                    "You've added the maximum quantity available for this item",
                });
              }

              productInCart.quantity = newQuantity;
              productInCart.price = newPrice;

              // Recalculate total price
              cart.totalprice = cart.products.reduce(
                (total, product) => total + product.price,
                0
              );

              cart.originalprice = cart.totalprice;

              await cart.save({ session });

              await session.commitTransaction();
              session.endSession();

              return res.status(200).send({
                status: 200,
                message: "Item successfully added",
              });
            } else {
              cart.products.push({
                productID: item.categoryname.product._id,
                productname: item.categoryname.product.productname,
                quantity: 1,
                price: originalPrice,
                image: item?.categoryname.product.image,
              });

              // Recalculate total price
              cart.totalprice = cart.products.reduce(
                (total, product) => total + product.price,
                0
              );
              cart.originalprice = cart.totalprice;
              await cart.save({ session });

              await session.commitTransaction();
              session.endSession();

              return res.status(200).send({
                status: 200,
                message: "Item successfully added",
              });
            }
          } else {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).send({
              status: 404,
              message: "Product not found",
            });
          }
        } else {
          await session.abortTransaction();
          session.endSession();
          return res.status(200).send({
            status: 201,
            message: "Your cart contains items from another restaurant",
          });
        }
      } else {
        const cartitem = await mongoose.connection.db
          .collection("products")
          .aggregate([
            { $unwind: "$categoryname" },
            { $unwind: "$categoryname.product" },
            { $match: { "categoryname.product._id": productId } },
          ])
          .toArray();

        if (cartitem.length > 0) {
          const item = cartitem[0];

          cart = new CART({
            userID: userID,
            storeDetails: [storeInfo],
            products: [
              {
                productID: item.categoryname.product._id,
                productname: item.categoryname.product.productname,
                quantity: 1,
                price: item.categoryname.product.price,
                image: item?.categoryname.product.image,
              },
            ],
            totalprice: item.categoryname.product.price,
            originalprice: item.categoryname.product.price,
          });

          await cart.save({ session });

          await session.commitTransaction();
          session.endSession();

          return res.status(200).send({
            status: 200,
            message: "Item successfully added",
          });
        } else {
          await session.abortTransaction();
          session.endSession();
          return res.status(404).send({
            status: 404,
            message: "Product not found",
          });
        }
      }
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      if (attempt < MAX_RETRIES) {
        // Retry the transaction
        continue;
      }

      console.log("Error while adding product to cart", error);
      return res.status(500).send({
        status: 500,
        message: "An error occurred while adding the item to the cart",
      });
    }
  }
});

const addNewItemToCart = asyncHandler(async (req, res) => {
  try {
    const { message, userID } = req.body;

    const cart = await CART.findOne({ userID: userID });

    if (!cart) {
      return res.status(405).send({
        message: "Cart doesnot exist",
      });
    }

    if (message) {
      await CART.deleteOne({ userID });
    }

    return res.status(200).send({
      status: 200,
      cart,
      message: "Successfully removed previous cart items",
    });
  } catch (error) {
    console.log("Error ! while adding new item to the cart", error);
  }
});

const getCartItems = asyncHandler(async (req, res) => {
  const { userID } = req.body;

  const userCartItem = await CART.find({ userID: userID });

  for (let cartItem of userCartItem) {
    if (!cartItem.products.length) {
      await CART.findByIdAndDelete(cartItem._id);
    }
  }

  if (!userCartItem) {
    return res.status(200).send({
      status: 201,
      message: "No cart Items",
      products: [],
    });
  }

  return res.status(200).send({
    status: 200,
    userCartItem,
  });
});

const removeItemQuantity = asyncHandler(async (req, res) => {
  try {
    const { storeID, userID, _id, cartID } = req.body;

    const objectId = new mongoose.Types.ObjectId(storeID);
    const productId = new mongoose.Types.ObjectId(_id);
    const userid = new mongoose.Types.ObjectId(userID);

    console.log("cartid--->", cartID);

    if (cartID) {
      const cartid = new mongoose.Types.ObjectId(cartID);
      let cart = await CART.findOne({ _id: cartid });

      console.log("First cart--->", cart);

      if (cart.products.length <= 0) {
        const cart = await CART.findOneAndDelete({ _id: cartid });
        await cart.save();
      }

      if (!cart) {
        return res.status(405).send({
          message: "Invalid store credentials",
        });
      }

      const existingProduct = cart.products?.find(
        (ele) => ele.productID.toString() === productId.toString()
      );

      if (!existingProduct) {
        return res.status(405).send({
          message: "Invalid product credentials or product not found",
        });
      }

      let actualprice = existingProduct.price;

      let actualQuantity = existingProduct.quantity;

      let amounttoDeduct = actualprice / actualQuantity;

      let newQuantity = existingProduct.quantity - 1;

      let newPrice = actualprice - amounttoDeduct;

      if (newQuantity <= 0) {
        cart.products = cart.products.filter(
          (ele) => ele.productID.toString() !== productId.toString()
        );
      } else {
        existingProduct.quantity = newQuantity;

        existingProduct.price = newPrice;
      }

      cart.totalprice = cart.products.reduce(
        (total, product) => total + product.price,
        0
      );
      cart.originalprice = cart.totalprice;

      await cart.save();
      return res.status(200).send({
        status: 200,
        existingProduct,
      });
    } else if (!cartID) {
      let cart = await CART.findOne({ userID: userid });

      console.log("second cart--->", cart);

      if (cart.products.length <= 0) {
        const cart = await CART.findOneAndDelete({ userID: userid });
        await cart.save();
      }

      if (!cart) {
        return res.status(405).send({
          message: "Invalid store credentials",
        });
      }

      const existingProduct = cart.products?.find(
        (ele) => ele.productID.toString() === productId.toString()
      );

      if (!existingProduct) {
        return res.status(405).send({
          message: "Invalid product credentials or product not found",
        });
      }

      console.log("Existing", existingProduct);

      let actualprice = existingProduct.price;

      let actualQuantity = existingProduct.quantity;

      let amounttoDeduct = actualprice / actualQuantity;

      let newQuantity = existingProduct.quantity - 1;

      let newPrice = actualprice - amounttoDeduct;

      if (newQuantity <= 0) {
        cart.products = cart.products.filter(
          (ele) => ele.productID.toString() !== productId.toString()
        );
      } else {
        existingProduct.quantity = newQuantity;

        existingProduct.price = newPrice;
      }

      cart.totalprice = cart.products.reduce(
        (total, product) => total + product.price,
        0
      );
      cart.originalprice = cart.totalprice;

      await cart.save();

      console.log("existing cart-->", existingProduct);

      return res.status(200).send({
        status: 200,
        existingProduct,
      });
    }
  } catch (error) {
    console.log("Error while decrementing item quantity", error);
  }
});

const payNow = async (req, res) => {
  const { userID } = req.body;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Fetch the user's cart
    let cart = await CART.findOne({ userID: userID }).session(session);
    if (!cart || !cart.products.length) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).send({
        message: "Cart is empty or not found",
      });
    }

    const now = new Date();
    const lockDuration = 1 * 60 * 1000; // 10 minutes in milliseconds
    const lockedUntil = new Date(now.getTime() + lockDuration);

    for (let cartItem of cart.products) {
      const productId = cartItem.productID;
      const requestedQuantity = cartItem.quantity;

      // Fetch the product
      const product = await mongoose.connection.db
        .collection("products")
        .aggregate(
          [
            { $unwind: "$categoryname" },
            { $unwind: "$categoryname.product" },
            {
              $match: {
                "categoryname.product._id": new mongoose.Types.ObjectId(
                  productId
                ),
                "categoryname.product.quantity": { $gte: requestedQuantity },
              },
            },
          ],
          { session }
        )
        .toArray();

      if (!product || product.length === 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(409).send({
          status: 409,
          message: `Product ${cartItem.productname} out of stock or requested quantity exceeds available quantity`,
        });
      }

      const productToUpdate = product[0];
      const availableQuantity = productToUpdate.categoryname.product.quantity;

      // Check if there are any active reservations for the product that overlap with the current request
      const existingReservations = await Reservation.aggregate([
        {
          $match: {
            productID: new mongoose.Types.ObjectId(productId),
            lockedUntil: { $gte: now },
          },
        },
        {
          $group: {
            _id: null,
            totalReserved: { $sum: "$quantity" },
          },
        },
      ]).session(session);

      // Create a reservation
      const reservation = new Reservation({
        productID: productId,
        userID: userID,
        storeID: productToUpdate.storeID,
        quantity: requestedQuantity,
        lockedUntil: lockedUntil,
      });

      await reservation.save({ session });

      // Update the product quantity
      const updateResult = await mongoose.connection.db
        .collection("products")
        .updateOne(
          {
            "categoryname.product._id": new mongoose.Types.ObjectId(productId),
          },
          {
            $inc: {
              "categoryname.$[].product.$[p].quantity": -requestedQuantity,
            },
          },
          {
            arrayFilters: [{ "p._id": new mongoose.Types.ObjectId(productId) }],
            session,
          }
        );

      if (!updateResult.modifiedCount) {
        await session.abortTransaction();
        session.endSession();
        console.error(`Failed to update product ${cartItem.productname}`);
        return res.status(500).send({
          status: 500,

          message: `Failed to update product ${cartItem.productname}`,
        });
      }
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(200).send({
      status: 200,
      message: "Purchase successful, complete the payment within 10 minutes",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error during payment process", error);
    return res.status(500).send({
      status: 500,
      message: "An error occurred during the payment process",
    });
  }
};

const cleanupExpiredReservations = async () => {
  const now = new Date();

  try {
    // Find reservations that are expired and paymentDone is false
    const expiredReservations = await Reservation.find({
      lockedUntil: { $lte: now },
      ispaymentdone: false,
    });

    // Process each expired reservation
    for (let reservation of expiredReservations) {
      // Update original product quantity
      await mongoose.connection.db.collection("products").updateOne(
        {
          "categoryname.product._id": reservation.productID,
        },
        {
          $inc: {
            "categoryname.$[].product.$[p].quantity": reservation.quantity,
          },
        },
        {
          arrayFilters: [{ "p._id": reservation.productID }],
        }
      );

      // Remove the reservation
      await Reservation.findByIdAndDelete(reservation._id);
    }

    console.log(
      `Expired reservations cleaned up: ${expiredReservations.length}`
    );
  } catch (error) {
    console.error("Error cleaning up expired reservations:", error);
  }
};

// Schedule cleanup periodically (every minute in this example)
// setInterval(cleanupExpiredReservations, 60 * 1000); //

const ClearCartItems = asyncHandler(async (req, res) => {
  try {
    const { userID } = req.body;

    if (userID) {
      await CART.findOneAndDelete({ userID: userID });
    }
    return res.status(200).send({
      status: 200,
      message: "Cart items is cleared",
    });
  } catch (error) {
    console.log("Error while clearing cart Items", error);
  }
});

export {
  addItemToCart,
  addNewItemToCart,
  getCartItems,
  removeItemQuantity,
  payNow,
  ClearCartItems,
};
