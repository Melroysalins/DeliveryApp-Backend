import { CART } from "../Models/cart.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const OfferApplied = asyncHandler(async (req, res) => {
  try {
    const { applied, userID, offer, storeID, product } = req.body;

    let cart = await CART.findOne({ userID: userID });

    if (!cart) {
      return res.status(400).send({
        message: "No products found in cart",
      });
    }

    // Calculate the original total price if it's not already stored
    if (!cart.originalprice) {
      cart.originalprice = cart.products.reduce(
        (acc, product) => acc + product.price * product.quantity,
        0
      );
    }

    let totalPrice;

    if (applied) {
      // Apply discount
      const discount = (offer / 100) * cart.originalprice;
      totalPrice = cart.originalprice - discount;
      cart.offerapplied = true;
    } else {
      // Revert to the original price
      totalPrice = cart.originalprice;
      cart.offerapplied = false;
    }

    cart.totalprice = totalPrice;
    await cart.save();

    return res.status(200).send({
      status: 200,
      cart,
    });
  } catch (error) {
    console.log("Error while applying offer coupon", error);
    return res.status(500).send({
      message: "Internal server error",
    });
  }
});

export { OfferApplied };
