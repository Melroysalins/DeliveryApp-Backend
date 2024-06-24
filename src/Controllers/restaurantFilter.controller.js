import { Restaurant } from "../Models/restaurantList.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const restaurantFilter = asyncHandler(async (req, res) => {
  try {
    const { deliveryTime, offer, veg, Nonveg } = req.body;

    let restaurantList = await Restaurant.find({}, "restaurantlist");

    let restaurantInfo = restaurantList[0].restaurantlist;

    if (deliveryTime) {
      restaurantInfo = restaurantInfo.sort(
        (a, b) => a.deliveryTime - b.deliveryTime
      );
    }
    if (offer) {
      restaurantInfo = restaurantInfo.sort((a, b) => {
        const offerA = parseFloat(a.offer);
        const offerB = parseFloat(b.offer);
        return offerB - offerA; // Sort in descending order
      });
    }
    if (veg) {
      restaurantInfo = restaurantInfo.filter(
        (ele) => ele?.restauranttype === "Veg"
      );
    }
    if (Nonveg) {
      restaurantInfo = restaurantInfo.filter(
        (ele) => ele?.restauranttype === "NonVeg"
      );
    }
    return res.status(200).send({
      status: 200,
      message: "filtered restaurant successfully",
      restaurantInfo,
    });
  } catch (error) {
    console.log("Error while listing restaurants based on filter", error);
  }
});

const OfferRestaurantList = asyncHandler(async (req, res) => {
  try {
    const restaurant = await Restaurant.find({}, "restaurantlist");

    const sorted = restaurant
      .map((restaurant) => restaurant.restaurantlist)
      .flat()
      .filter((item) => item.offer !== null && item.offer !== "null");

    return res.status(200).send({
      status: 200,
      sorted,
    });
  } catch (error) {
    console.log("Error while fetching restaurant with offers", error);
  }
});

const restaurantorfoodSearch = asyncHandler(async (req, res) => {
  try {
    const { searchvalue } = req.body;

    const productlist = await mongoose.connection.db
      .collection("products")
      .aggregate([
        {
          $unwind: "$categoryname",
        },
        {
          $unwind: "$categoryname.product",
        },
        {
          $match: {
            "categoryname.product.productname": {
              $regex: searchvalue,
              $options: "i",
            },
          },
        },
        {
          $lookup: {
            from: "restaurants", // Ensure this collection name is correct
            localField: "storeID",
            foreignField: "restaurantlist.storeID",
            as: "storeDetails",
          },
        },
        {
          $unwind: "$storeDetails",
        },
        {
          $project: {
            _id: 0,
            productname: "$categoryname.product.productname",
            productimage: "$categoryname.product.image",
          },
        },
      ])
      .toArray();

    return res.status(200).send({
      status: 200,
      productlist,
    });
  } catch (error) {
    console.log("Error while searching products", error);
  }
});

const restaurantwithSearchedFood = asyncHandler(async (req, res) => {
  try {
    const { searchvalue } = req.body;

    const productsWithStoreDetails = await mongoose.connection.db
      .collection("products")
      .aggregate([
        {
          $unwind: "$categoryname",
        },
        {
          $unwind: "$categoryname.product",
        },
        {
          $match: {
            "categoryname.product.productname": {
              $regex: searchvalue,
              $options: "i",
            },
          },
        },
        {
          $project: {
            _id: "$categoryname.product._id",
            productname: "$categoryname.product.productname",
            productimage: "$categoryname.product.image",
            price: "$categoryname.product.price",
            storeID: "$storeID",
          },
        },
        {
          $lookup: {
            from: "restaurants",
            let: { productStoreID: "$storeID" },
            pipeline: [
              { $unwind: "$restaurantlist" },
              {
                $match: {
                  $expr: {
                    $eq: ["$restaurantlist.storeID", "$$productStoreID"],
                  },
                },
              },
              {
                $project: {
                  storename: "$restaurantlist.storename",
                  storeID: "$restaurantlist.storeID",
                  deliveryTime: "$restaurantlist.deliveryTime",
                  openTime: "$restaurantlist.openTime",
                  closeTime: "$restaurantlist.closeTime",
                  offer: "$restaurantlist.offer",
                  verified: "$restaurantlist.verified",
                  logo: "$restaurantlist.logo",
                  restauranttype: "$restaurantlist.restauranttype",
                  cuisine: "$restaurantlist.cuisine",
                  address: "$restaurantlist.address",
                },
              },
            ],
            as: "storeDetails",
          },
        },
        {
          $unwind: "$storeDetails",
        },
        {
          $project: {
            _id: 1,
            productname: 1,
            productimage: 1,
            storeID: 1,
            price: 1,
            storename: "$storeDetails.storename",
            deliveryTime: "$storeDetails.deliveryTime",
            openTime: "$storeDetails.openTime",
            closeTime: "$storeDetails.closeTime",
            offer: "$storeDetails.offer",
            verified: "$storeDetails.verified",
            logo: "$storeDetails.logo",
            restauranttype: "$storeDetails.restauranttype",
            cuisine: "$storeDetails.cuisine",
            address: "$storeDetails.address",
          },
        },
      ])
      .toArray();

    return res.status(200).send({
      status: 200,
      productsWithStoreDetails,
    });
  } catch (error) {
    console.log("Error while fetching restaurants", error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
});

export {
  restaurantFilter,
  OfferRestaurantList,
  restaurantorfoodSearch,
  restaurantwithSearchedFood,
};
