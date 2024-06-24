import Router from "express";
import {
  getUserInfo,
  setUserAddress,
  userLogin,
  userRegister,
} from "../Controllers/user.controller.js";
import {
  getRestaurantList,
  getRestaurantMenu,
  searchProductinRestaurantMenuMenu,
} from "../Controllers/restaurant.controller.js";
import {
  OfferRestaurantList,
  restaurantFilter,
  restaurantorfoodSearch,
  restaurantwithSearchedFood,
} from "../Controllers/restaurantFilter.controller.js";
import { addItemToCart } from "../Controllers/cart.controller.js";

const router = Router();

router.route("/user/register").post(userRegister);

router.route("/user/login").post(userLogin);

router.route("/user/setaddress").post(setUserAddress);

router.route("/user/getUser").post(getUserInfo);

router.route("/user/getrestaurantlist").post(getRestaurantList);

router.route("/user/getmenulist").post(getRestaurantMenu);

router.route("/user/filter").post(restaurantFilter);

router.route("/user/searchmenu").post(searchProductinRestaurantMenuMenu);

router.route("/user/offerrestaurant").get(OfferRestaurantList);

router.route("/user/searchfoodorrestaurant").post(restaurantorfoodSearch);

router.route("/user/food").post(restaurantwithSearchedFood);

router.route("/user/addtocart").post(addItemToCart);

export { router };
