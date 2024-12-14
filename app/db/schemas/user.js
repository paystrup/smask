import mongoose from "mongoose";
const { Schema } = mongoose;
import { Diets } from "../constants";
import validateURL from "~/utils/server/schemaValidation";

export const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      maxLength: [30, "Firstname must be max. 20 characters long"],
      minLength: [3, "Firstname must be at least 3 characters long"],
    },
    lastName: {
      type: String,
      required: true,
      maxLength: [20, "Lastname must be max. 20 characters long"],
      minLength: [3, "Lastname must be at least 3 characters long"],
    },
    birthday: {
      type: Date,
      required: true,
    },
    diet: {
      type: String,
      enum: Object.values(Diets),
      default: undefined,
    },
    email: {
      type: String,
      required: true,
      unique: [true, "Account with this email already exists"],
      maxLength: [30, "Your email can be max. 30 characters long"],
    },
    favoriteMeal: {
      type: String,
      required: false,
      maxLength: [50, "Favorite meal must be max. 50 characters long"],
    },
    password: {
      type: String,
      required: true,
      select: false, // Exclude pw from query results by default
      minLength: [8, "Password must be at least 8 characters long"],
    },
    admin: {
      type: Boolean,
      default: false,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    image: {
      type: String,
      validate: [validateURL, "Please fill a valid image URL"],
      required: false,
    },
    resetPasswordToken: {
      type: String,
      select: false, // Exclude from query results by default
    },
  },
  { timestamps: true },
);
