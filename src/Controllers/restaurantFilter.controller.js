import { Restaurant } from "../Models/restaurantList.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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
      restaurantInfo = restaurantInfo.sort((a, b) => a.offer - b.offer);
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

export { restaurantFilter };
