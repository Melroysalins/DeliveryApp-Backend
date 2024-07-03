import dotenv from "dotenv";
import { app } from "./app.js";
import { ConnectDB } from "./DB/index.js";
import Razorpay from "razorpay";

dotenv.config({
  path: "./.env",
});

export const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});

ConnectDB()
  .then(() =>
    app.listen(process.env.PORT, () => {
      console.log("Connected to database at port !!", process.env.PORT);
    })
  )
  .catch((error) => {
    console.log("Failed to connect !!", error);
  });
