import { Restaurant } from "../Models/restaurantList.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const { ObjectId } = mongoose.Types;

const getRestaurantList = asyncHandler(async (req, res) => {
  try {
    const { state_district } = req.body;

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

    const product = await productInfo.findOne({
      storeID: new ObjectId(storeID),
    });

    return res.status(200).send({
      storeInfo,
      product,
    });
  } catch (error) {
    console.log("Failed to get restaurantmenu", error);
  }
});

export { getRestaurantList, getRestaurantMenu };
