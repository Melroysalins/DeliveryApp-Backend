import { Restaurant } from "../Models/restaurantList.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const { ObjectId } = mongoose.Types;

const getRestaurantList = asyncHandler(async (req, res) => {
  try {
    const { state_district } = req.body;

    console.log("State--->", state_district);

    const stateDistrictRegex = new RegExp(state_district, "i");
    const shortStateDistrictRegex = new RegExp(
      state_district.replace(/ district/i, ""),
      "i"
    );

    const stores = await mongoose.connection.db
      .collection("stores")
      .aggregate([
        {
          $match: {
            $or: [
              {
                "address.0.state_district": stateDistrictRegex || "Bangalore",
              },

              {
                "address.0": shortStateDistrictRegex,
              },
            ],
          },
        },
      ])
      .toArray();

    if (stores.length === 0) {
      return res.status(200).send({
        message: "No restaurant registered near your area",
        stores,
      });
    }

    const topratedRestaurant = stores
      .sort((a, b) => b.offer - a.offer)
      .slice(0, 4);

    const list = await Restaurant.findOneAndUpdate(
      {},
      {
        $set: {
          toprated: topratedRestaurant,
          restaurantlist: stores,
        },
      },
      { upsert: true, new: true }
    );

    return res.status(200).send({
      status: 200,
      message: "successfully fetched list of restaurant list",
      list,
    });
  } catch (error) {
    console.log("Error while fetching restaurant list", error);
  }
});

const getRestaurantMenu = asyncHandler(async (req, res) => {
  try {
    const { storeID } = req.body;

    const productInfo = mongoose.connection.db.collection("products");

    const stores = mongoose.connection.db.collection("stores");

    const storeInfo = await stores.findOne({
      storeID: new ObjectId(storeID),
    });

    if (!storeInfo?.availability?.open) {
      return res.status(200).send({
        status: 200,
        storeInfo,
      });
    }

    const product = await productInfo.findOne({
      storeID: new ObjectId(storeID),
    });

    // Filter out products where quantity > 0
    const filteredProducts = product.categoryname.map((category) => ({
      ...category,
      product: category.product.filter((item) => item.quantity > 0),
    }));

    return res.status(200).send({
      status: 200,
      storeInfo,
      product: {
        ...product,
        categoryname: filteredProducts,
      },
    });
  } catch (error) {
    console.log("Failed to get restaurantmenu", error);
  }
});

const searchProductinRestaurantMenuMenu = asyncHandler(async (req, res) => {
  try {
    const { storeID, name } = req.body;

    const products = mongoose.connection.db.collection("products");

    const product = await products
      .aggregate([
        {
          $match: {
            storeID: new ObjectId(storeID),
          },
        },
        {
          $unwind: "$categoryname",
        },
        {
          $unwind: "$categoryname.product",
        },
        {
          $match: {
            "categoryname.product.productname": {
              $regex: name,
              $options: "i",
            },
          },
        },
        {
          $group: {
            _id: "$_id",
            matchedProducts: { $push: "$categoryname.product" },
          },
        },
      ])
      .toArray();

    if (!product) {
      return res.status(200).send({
        message: "Invalid Store Credential",
      });
    }
    return res.status(200).send({
      status: 200,
      product,
    });
  } catch (error) {
    console.log("Error while Searching items in restaurant menu", error);
  }
});

export {
  getRestaurantList,
  getRestaurantMenu,
  searchProductinRestaurantMenuMenu,
};
