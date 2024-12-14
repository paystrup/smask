import bcrypt from "bcryptjs";
import { tagSchema } from "./schemas/tags";
import { userSchema } from "./schemas/user";
import { mealSchema } from "./schemas/meal";
import { mealDaySchema } from "./schemas/mealDay";
import { locationSchema } from "./schemas/location";
import { guestSchema } from "./schemas/guest";

// Pre-save hooks
userSchema.pre("validate", async function (next) {
  const user = this;
  if (!user.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Indexing for text search
mealSchema.index({ title: "text", description: "text", tags: "text" });

// Register models with mongoose
export const models = [
  {
    name: "User",
    schema: userSchema,
    collection: "users",
  },
  {
    name: "Tag",
    schema: tagSchema,
    collection: "tags",
  },
  {
    name: "Meal",
    schema: mealSchema,
    collection: "meals",
  },
  {
    name: "Mealday",
    schema: mealDaySchema,
    collection: "mealDays",
  },
  {
    name: "Location",
    schema: locationSchema,
    collection: "locations",
  },
  {
    name: "Guest",
    schema: guestSchema,
    collection: "guests",
  },
];
