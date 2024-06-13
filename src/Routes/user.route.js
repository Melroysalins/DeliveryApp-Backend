import Router from "express";
import {
  getUserInfo,
  setUserAddress,
  userLogin,
  userRegister,
} from "../Controllers/user.controller.js";

const router = Router();

router.route("/user/register").post(userRegister);

router.route("/user/login").post(userLogin);

router.route("/user/setaddress").post(setUserAddress);

router.route("/user/getUser").post(getUserInfo);

export { router };
