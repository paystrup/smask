import mongoose from "mongoose";
const { Schema } = mongoose;

export const mealDaySchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true, // Ensure the date is unique
    },
    visible: {
      type: Boolean,
      default: false,
    },
    canceled: {
      type: Boolean,
      default: false,
    },
    meals: [
      {
        meal: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Meal",
          required: true,
        },
        startTime: {
          type: Date,
          required: true,
        },
        endTime: {
          type: Date,
          required: true,
        },
      },
    ],
    attendees: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
    ],
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    // Seperate guests from users, so we can track who added them
    // Also user does not need to attend to add guests
    guests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Guest",
      },
    ],
  },
  { timestamps: true },
);
