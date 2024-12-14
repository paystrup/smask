import mongoose from "mongoose";
import { Diets } from "../constants";
const { Schema } = mongoose;

export const guestSchema = new Schema({
  diet: {
    type: String,
    enum: Object.values(Diets),
    default: undefined,
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});
