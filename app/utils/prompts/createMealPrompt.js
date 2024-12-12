// Prompt for creating a new meal.
// Output should be a JSON object with the following fields

import {
  mealDescriptionMaxLength,
  mealDescriptionMinLength,
  mealTitleMaxLength,
  mealTitleMinLength,
} from "~/db/constants";
import { AllergyType, Seasons } from "~/db/models";

export const createMealPrompt = (mealPrompt) => {
  return `
     Create a new meal inspired by the following prompt: "${mealPrompt}"

     Ensure that the following constraints are met:
    - **Title**: A title for the meal and accessories (between ${mealTitleMinLength} and ${mealTitleMaxLength} characters).
    - **Description**: A short description of the meal (between ${mealDescriptionMinLength} and ${mealDescriptionMaxLength} characters).
    - **Allergies**: A list of allergies (Must be either ${Object.values(AllergyType).join(", ")}). This can be an empty list if there are no known allergies.
    - **Seasons**: The seasons during which this meal is ideal (Must be either ${Object.values(Seasons).join(", ")}). Please provide at least one season.
    - **Tags**: Tags that best describe the meal, should be descriptive and relevant (e.g., vegetarian, low-carb, spicy, etc.). Provide at least one tag.

    Example output:
    {
      "title": "Spaghetti Bolognese with Garlic Bread and Parmesan",
      "description": "A classic Italian pasta dish with a rich, savory meat sauce. Served with crispy garlic bread and a sprinkle of Parmesan cheese.",
      "allergies": ["gluten", "dairy"],
      "seasons": ["winter", "fall"],
      "tags": ["italian", "comfort food"]
    }
    
    Make sure your response follows this format with valid data.
  `;
};
