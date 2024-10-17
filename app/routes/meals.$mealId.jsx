import {
  useLoaderData,
  useRouteError,
  isRouteErrorResponse,
} from "@remix-run/react";
import { json } from "@remix-run/node";
import mongoose from "mongoose";

export async function loader({ params }) {
  const meal = await mongoose.models.Meal.findById(params.mealId);
  if (!meal) {
    throw new Response(`Couldn't find book with id ${params.mealId}`, {
      status: 404,
    });
  }
  return json(meal);
}

export default function BookPage() {
  const meal = useLoaderData();
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">{meal.title}</h1>
      <code>
        <pre>{JSON.stringify(meal, null, 2)}</pre>
      </code>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>{`${error.status} ${error.statusText}`}</h1>
        <h2>{error.data}</h2>
      </div>
    );
  }

  return (
    <h1 className="font-bold text-red-500">
      {error?.name}: {error?.message}
    </h1>
  );
}
