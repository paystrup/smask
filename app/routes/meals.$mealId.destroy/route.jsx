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
    // Delete the meal from the database
    const result = await mongoose.models.Meal.findByIdAndDelete(params.mealId);

    if (!result) {
      throw new Error("Meal not found or already deleted");
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
