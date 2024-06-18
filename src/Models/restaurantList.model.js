import mongoose, { Schema } from "mongoose";

const restaurantListSchema = new mongoose.Schema(
  {
    toprated: {
      type: Array,
    },

    restaurantlist: {
      type: Array,
    },
  },

  { timestamps: true }
);

export const Restaurant = mongoose.model("Restaurant", restaurantListSchema);
