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
import {
  ClearCartItems,
  addItemToCart,
  addNewItemToCart,
  getCartItems,
  payNow,
  removeItemQuantity,
} from "../Controllers/cart.controller.js";
import { OfferApplied } from "../Controllers/offer.controller.js";
import {
  OrderDetailsSave,
  checkout,
  paymentVerification,
  returnrazorkey,
} from "../Controllers/payment.controller.js";
import {
  DeleteReservation,
  connectionWithSToreandUser,
  mergecartwithRegisterUser,
} from "../Controllers/paynow.controller.js";

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

router.route("/user/removeExistingItem").post(addNewItemToCart);

router.route("/user/getCart").post(getCartItems);

router.route("/user/removeItem").post(removeItemQuantity);

router.route("/user/paynow").post(payNow);

router.route("/user/offer").post(OfferApplied);

router.route("/user/payment").post(checkout);

router.route("/user/paymentverification").post(paymentVerification);

router.route("/user/getkey").get(returnrazorkey);

router.route("/user/ordersave").post(OrderDetailsSave);

router.route("/user/clearcart").post(ClearCartItems);

router.route("/user/delete").post(DeleteReservation);

router.route("/user/connect").post(connectionWithSToreandUser);

router.route("/user/mergecart").post(mergecartwithRegisterUser);

export { router };
