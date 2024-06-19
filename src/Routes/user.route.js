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
import { restaurantFilter } from "../Controllers/restaurantFilter.controller.js";

const router = Router();

router.route("/user/register").post(userRegister);

router.route("/user/login").post(userLogin);

router.route("/user/setaddress").post(setUserAddress);

router.route("/user/getUser").post(getUserInfo);

router.route("/user/getrestaurantlist").post(getRestaurantList);

router.route("/user/getmenulist").post(getRestaurantMenu);

router.route("/user/filter").post(restaurantFilter);

router.route("/user/searchmenu").post(searchProductinRestaurantMenuMenu);

export { router };
