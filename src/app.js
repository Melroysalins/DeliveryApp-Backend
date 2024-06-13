import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import cloudinary from "cloudinary";

const app = express();

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

app.use(
  cors({
    origin: process.env.CORS,
    credentials: true,
  })
);

app.use(cookieParser());

app.use(
  express.json({
    limit: "16kb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);

app.use(express.static("public"));

import { router } from "./Routes/user.route.js";

app.use("/api", router);

export { app };
