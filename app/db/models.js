import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import validateURL from "~/utils/schemaValidation";

const { Schema } = mongoose;

// Expanded Enum for predefined ingredient categories
export const IngredientCategory = {
  VEGETABLE: "Vegetable",
  MEAT: "Meat",
  DAIRY: "Dairy",
  SEAFOOD: "Seafood",
  GRAIN: "Grain",
  FRUIT: "Fruit",
  NUTS: "Nuts",
  SPICES: "Spices",
  LEGUMES: "Legumes",
  BEVERAGE: "Beverage",
  SWEETENERS: "Sweeteners",
  FATS_OILS: "Fats and Oils",
  HERBS: "Herbs",
  POULTRY: "Poultry",
  PORK: "Pork",
  BEEF: "Beef",
  LAMB: "Lamb",
  SEAWEED: "Seaweed",
  PASTA: "Pasta",
  BAKING: "Baking",
  CONDIMENTS: "Condiments",
};

// Expanded Enum for predefined allergies
export const AllergyType = {
  MILK: "milk",
  FISH: "fish",
  SHELLFISH: "shellfish",
  PEANUTS: "peanuts",
  TREE_NUTS: "tree nuts",
  EGGS: "eggs",
  WHEAT: "wheat",
  SOY: "soy",
  SESAME: "sesame",
  GLUTEN: "gluten",
  CORN: "corn",
  SULFITES: "sulfites",
  MUSTARD: "mustard",
  CELERY: "celery",
  LUPIN: "lupin",
};

// Enum for seasons
export const Seasons = {
  SPRING: "spring",
  SUMMER: "summer",
  AUTUMN: "autumn",
  WINTER: "winter",
  CHRISTMAS: "christmas",
};

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: [2, "Tag name is too short"],
    maxlength: [30, "Tag name is too long"],
  },
});

// User Schema
const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      maxLength: [20, "Firstname must be max. 20 characters long"],
    },
    lastName: {
      type: String,
      required: true,
      maxLength: [20, "Lastname must be max. 20 characters long"],
    },
    email: {
      type: String,
      required: true,
      unique: [true, "Account with this email already exists"],
      maxLength: [30, "Your email can be max. 30 characters long"],
    },
    password: {
      type: String,
      required: true,
      select: false, // Exclude pw from query results by default
    },
    admin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Pre-save hook for user password hashing
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

// Ingredient Schema
// const ingredientSchema = new Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       minLength: [2, "Ingredient name is too short"],
//       maxLength: [50, "Ingredient name is too long"],
//     },
//     category: {
//       type: String,
//       enum: Object.values(IngredientCategory),
//       required: true,
//     },
//     allergies: [
//       {
//         type: String,
//         enum: Object.values(AllergyType),
//       },
//     ],
//   },
//   { timestamps: true },
// );

// Meal Schema
const mealSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      minLength: [3, "Meal title is too short"],
      maxLength: [50, "Meal title is too long"],
    },
    description: {
      type: String,
      required: true,
      minLength: [10, "Description is too short"],
      maxLength: [300, "Description is too long"],
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

const mealDaySchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true, // Ensure the date is unique
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
        numberOfPeople: {
          type: Number,
          default: 1, // Default to 1 person
        },
      },
    ],
  },
  { timestamps: true },
);

// Register models with mongoose
export const models = [
  {
    name: "User",
    schema: userSchema,
    collection: "users",
  },
  // {
  //   name: "Ingredient",
  //   schema: ingredientSchema,
  //   collection: "ingredients",
  // },
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
];
