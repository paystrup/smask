import mongoose from "mongoose";
const { Schema } = mongoose;

export const locationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: [3, "Location name must be at least 3 characters long"],
      maxlength: [50, "Location name must be less than 50 characters long"],
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true },
);
