import mongoose from "mongoose";
const { Schema } = mongoose;

export const tagSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: [2, "Tag name is too short"],
    maxlength: [30, "Tag name is too long"],
  },
});
