import { Form, useLoaderData } from "@remix-run/react";
import { Search } from "lucide-react";
import mongoose from "mongoose";
import MealCard from "~/_components/cards/MealCard";
import { Input } from "~/components/ui/input";
import { json } from "@remix-run/node";

export function meta() {
  return [{ title: "smask | All meals" }];
}

export async function loader({ request }) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("q");

    // Reference: https://www.mongodb.com/docs/manual/reference/operator/query/text/
    let meals;
    if (query) {
      meals = await mongoose.models.Meal.find({
        $text: { $search: query },
      }).populate("tags");
    } else {
      meals = await mongoose.models.Meal.find().populate("tags");
    }

    return json({ meals, query });
  } catch (error) {
    console.error(error);
    return json(
      { error: "An error occurred while loading data" },
      { status: 500 },
    );
  }
}

export default function Meals() {
  const { meals, query } = useLoaderData();
  console.log(meals, query);
  const title = "Search for delicious meals in your Smask library";
  const noResultsText = "No meals found. Please try another search.";
  const queryFallback = query
    ? `(${meals?.length}) Results for "${query}"`
    : `All meals (${meals?.length})`;

  return (
    <section className="mt-8">
      <div className="flex items-center justify-center text-center flex-col gap-12">
        <h1 className="text-5xl font-medium tracking-tighter max-w-[25ch]">
          {title}
        </h1>

        <Form className="w-full" method="get" action="/meals/all">
          <div className="relative w-full">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              name="q"
              type="search"
              id="search"
              placeholder={
                query
                  ? query
                  : "Search for meals, descriptions, ingredients, etc."
              }
              className="pl-8"
            />
          </div>

          <button type="submit" hidden>
            Search
          </button>
        </Form>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="m-3 mt-8 text-2xl font-bold tracking-tight">
          {queryFallback}
        </h2>

        {meals.length > 0 ? (
          <ul className="grid grid-cols-12 gap-8">
            {meals.map((meal) => {
              return (
                <li
                  key={meal._id}
                  className="col-span-12 xl:col-span-6 2xl:col-span-3"
                >
                  <MealCard
                    link={`/meals/${meal._id}`}
                    title={meal.title}
                    description={meal.description}
                    tags={meal.tags}
                    allergies={meal.allergies}
                    seasons={meal.seasons}
                    imageUrl={meal.image}
                  />
                </li>
              );
            })}
          </ul>
        ) : (
          <h3 className="text-center text-3xl tracking-tight mt-20">
            {noResultsText}
          </h3>
        )}
      </div>
    </section>
  );
}
