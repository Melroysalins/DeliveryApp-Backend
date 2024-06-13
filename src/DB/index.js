import mongoose from "mongoose";
import { DB_Name } from "../constants.js";

const ConnectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URL}/${DB_Name}`
    );
  } catch (error) {
    console.log("Connection Failed in ConnectDB Function ", error);
  }
};

export { ConnectDB };
