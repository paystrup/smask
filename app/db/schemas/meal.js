import mongoose from "mongoose";
const { Schema } = mongoose;
import {
  AllergyType,
  mealDescriptionMaxLength,
  mealDescriptionMinLength,
  mealTitleMaxLength,
  mealTitleMinLength,
  Seasons,
} from "../constants";
import validateURL from "~/utils/server/schemaValidation";

export const mealSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      minLength: [mealTitleMinLength, "Meal title is too short"],
      maxLength: [mealTitleMaxLength, "Meal title is too long"],
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    description: {
      type: String,
      required: true,
      minLength: [mealDescriptionMinLength, "Description is too short"],
      maxLength: [mealDescriptionMaxLength, "Description is too long"],
    },
    ingredients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ingredient",
        required: true,
      },
    ],
    allergies: [
      {
        type: String,
        enum: Object.values(AllergyType),
      },
    ],
    seasons: [
      {
        type: String,
        enum: Object.values(Seasons),
        required: true,
      },
    ],
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
        required: true,
      },
    ],
    image: {
      type: String,
      validate: [validateURL, "Please fill a valid image URL"],
      required: false,
    },
  },
  { timestamps: true },
);
