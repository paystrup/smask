import { redirect } from "@remix-run/node";
import mongoose from "mongoose";
import { authenticator } from "~/services/auth.server";

export async function loader({ request }) {
  await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });

  return null;
}

export async function action({ request, params }) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });

  // Check if the user is an admin or return error
  if (!user.admin) {
    throw new Error("You are not authorized to delete meals");
  }

  try {
    const mealId = params.mealId;

    // Check if admin is allowed to delete, is it their location?
    const meal = await mongoose.models.Meal.findById(mealId);

    if (!meal) {
      throw new Error("Meal not found");
    }

    if (!meal.location.equals(user.location)) {
      throw new Error(
        "You are not authorized to delete meals from this location",
      );
    }

    // Delete the meal from the database
    const deletedMeal = await mongoose.models.Meal.findByIdAndDelete(mealId);

    if (!deletedMeal) {
      throw new Error("Meal not found or already deleted");
    }

    // Find all mealDays that contain this meal
    const mealDays = await mongoose.models.Mealday.find({
      "meals.meal": new mongoose.Types.ObjectId(mealId),
    });

    // Update each mealDay to remove the deleted meal completely
    for (const mealDay of mealDays) {
      mealDay.meals = mealDay.meals.filter((meal) => !meal.meal.equals(mealId));
      await mealDay.save();
    }

    return redirect("/meals/all");
  } catch (error) {
    console.error("Error deleting meal:", error.message);
    return {
      status: 500,
      message: "An error occurred while deleting the meal",
    };
  }
}
