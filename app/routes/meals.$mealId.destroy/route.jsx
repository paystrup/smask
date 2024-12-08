import { redirect, json } from "@remix-run/node";
import mongoose from "mongoose";
import { authenticator } from "~/services/auth.server";
import { MealDay } from "~/models/mealDay.server";
import { Meal } from "~/models/meal.server";

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

  // Check if the user is an admin
  if (!user.admin) {
    return json(
      { status: 403, message: "You are not authorized to delete meals" },
      { status: 403 },
    );
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Ensure the models are defined
    if (!MealDay || !Meal) {
      throw new Error("MealDay or Meal model is not defined");
    }

    const mealIdToDelete = new mongoose.Types.ObjectId(params.mealId);

    // Find all MealDay documents that contain the meal to be deleted
    const mealDaysToUpdate = await MealDay.find({
      "meals.meal": mealIdToDelete,
    }).session(session);

    console.log(`Found ${mealDaysToUpdate.length} MealDay documents to update`);

    // Update each MealDay document
    for (const mealDay of mealDaysToUpdate) {
      const originalLength = mealDay.meals.length;
      mealDay.meals = mealDay.meals.filter(
        (meal) => !meal.meal.equals(mealIdToDelete),
      );
      const newLength = mealDay.meals.length;

      console.log(
        `MealDay ${mealDay._id}: Removed ${originalLength - newLength} meal(s)`,
      );

      await mealDay.save({ session });
    }

    // Delete the meal from the database
    const result = await Meal.findByIdAndDelete(mealIdToDelete, { session });

    if (!result) {
      throw new Error("Meal not found or already deleted");
    }

    console.log(`Deleted meal with ID: ${mealIdToDelete}`);

    await session.commitTransaction();
    session.endSession();

    return redirect("/meals/all");
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error deleting meal:", error);
    return json(
      {
        status: 500,
        message: "An error occurred while deleting the meal",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
