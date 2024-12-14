// Prompt for creating a new meal.
// Output should be a JSON object with the following fields

import {
  AllergyType,
  mealDescriptionMaxLength,
  mealDescriptionMinLength,
  mealTitleMaxLength,
  mealTitleMinLength,
  Seasons,
} from "~/db/constants";

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

export const createMealDescriptionPrompt = (title) => {
  return `Describe a meal with the title "${title}. It must be a text string with the maximum length of ${mealDescriptionMaxLength} characters and minimum length of ${mealDescriptionMinLength} characters, no quotation marks. You must reply with only one short sentence.`;
};

export const createMealImagePrompt = (title) => {
  return `Generate a food image for a recipe book for the dish ${title}. The image should be colorful and vibrant, and have a clean background suitable for a recipe book.`;
};
