import { useLoaderData, Link } from "@remix-run/react";
import mongoose from "mongoose";

export async function loader() {
  const meals = await mongoose.models.Meal.find();
  return meals;
}

export default function Index() {
  const meals = useLoaderData();

  return (
    <div>
      <h2 className="mb-3 text-lg font-bold">
        All meals {"(" + meals?.length + ")"}
      </h2>
      <ul className="ml-5 list-disc">
        {meals &&
          meals.map((meal) => {
            return (
              <li key={meal._id}>
                <Link
                  to={`/meals/${meal._id}`}
                  className="text-blue-600 hover:underline"
                >
                  {meal.title}
                </Link>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
