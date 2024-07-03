import { User } from "../Models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const userRegister = asyncHandler(async (req, res) => {
  try {
    const { username, email, phone } = req.body;

    if ([username, email, phone].some((field) => field?.trim() === "")) {
      return res.status(402).send({
        message: "Please Enter all the fields",
      });
    }

    const userExist = await User.findOne({ phone: phone });

    if (userExist) {
      return res.status(403).send({
        message: "The phone number you entered is already registered",
      });
    }

    const userCreated = await User.create({
      username,
      email,
      phone,
    });

    if (!userCreated) {
      return res.status(405).send({
        message: "Error While registering the User",
      });
    }

    return res.status(200).send({
      status: 200,
      message: "User registered successfully",
      userCreated,
    });
  } catch (error) {
    console.log("Error! while registering the user", error);
  }
});

const userLogin = asyncHandler(async (req, res) => {
  try {
    const { email, phone } = req.body;

    const user = await User.findOne({
      $and: [{ email }, { phone }],
    });

    console.log("user--->", user);

    if (!user) {
      return res.status(403).send({
        message:
          "The email or password you entered is incorrect. Please try again.",
      });
    }

    return res.status(200).send({
      status: 200,
      message: "Logged in successfully",
      user,
    });
  } catch (error) {
    console.log("Failed to Login user", error);
  }
});

const setUserAddress = asyncHandler(async (req, res) => {
  try {
    const { data, _id } = req.body;

    const user = await User.findById(_id);

    if (!user) {
      return res.status(405).send({
        message: "Invalid user credentials",
      });
    }

    user.address.push(data);

    await user.save();

    return res.status(200).send({
      status: 200,
      message: "user address stored successfully",
      user,
    });
  } catch (error) {
    console.log("Failed to set sser address", error);
  }
});

const getUserInfo = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.body;

    const user = await User.findById(_id);

    if (!user) {
      return res.status(406).send({
        message: "User doesnot exist or invalid user credentials",
      });
    }

    return res.status(200).send({
      status: 200,
      message: "user details detched successfully",
      user,
    });
  } catch (error) {
    console.log("Error while fetching user details", error);
  }
});

export { userRegister, userLogin, setUserAddress, getUserInfo };
