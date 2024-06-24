import { CART } from "../Models/cart.model.js";
import { Restaurant } from "../Models/restaurantList.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const addItemToCart = asyncHandler(async (req, res) => {
  try {
    const { storeID, _id } = req.body;

    const objectId = new mongoose.Types.ObjectId(storeID);

    const productId = new mongoose.Types.ObjectId(_id);

    const product = await Restaurant.findOne({
      "restaurantlist.storeID": objectId,
    });

    const storeInfo = product.restaurantlist.find((store) =>
      store.storeID.equals(objectId)
    );

    let cart = await CART.findOne({ "storeDetails.storeID": objectId });

    if (!cart) {
      cart = new CART({
        _id: _id,
        storeID,
        storeDetails: [storeInfo],
      });
    }

    await cart.save();

    //   logic to check the product info

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

      cart.products.push({
        productID: item.categoryname.product._id,
        productname: item.categoryname.product.productname,
        quantity: 1,
        price: item.categoryname.product.price,
      });

      await cart.save();

      return res.status(200).send({
        status: 200,
        message: "Item successfully addded",
      });
    }
  } catch (error) {
    console.log("Error while adding product to cart", error);
  }
});

export { addItemToCart };
