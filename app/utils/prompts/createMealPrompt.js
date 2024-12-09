// Prompt for creating a new meal.
// Output should be a JSON object with the following fields

export const createMealPrompt = (mealPrompt) => {
  return `
    You are a professional chef working on a new menu for your restaurant.
    Please create a new meal inspired by the following prompt: "${mealPrompt}"

    - **Title**: A title for the meal and accessories (between 3 and 100 characters).
    - **Description**: A short description of the meal (between 10 and 300 characters).
    - **Allergies**: A list of allergies (e.g., gluten, dairy, nuts, etc.). This can be an empty list if there are no known allergies.
    - **Seasons**: The seasons during which this meal is ideal (e.g., spring, summer, fall, winter). Please provide at least one season.
    - **Tags**: Tags that best describe the meal (e.g., vegetarian, low-carb, spicy, etc.). Provide at least one tag.

    Ensure that the following constraints are met:
    - **Title**: Minimum length of 3 characters, maximum of 100 characters.
    - **Description**: Minimum length of 10 characters, maximum of 300 characters.
    - **Allergies**: List of allergy types (you can only use either: milk, fish, shellfish, peanuts, tree nuts, eggs, wheat, soy, sesame, gluten, corn, sulfites, mustard, celery, lupin). Can be empty.
    - **Seasons**: Use season names either "spring", "summer", "fall", or "winter" or "christmas" Include at least one season.
    - **Tags**: Include at least one tag. Tag names should be descriptive and relevant.

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
