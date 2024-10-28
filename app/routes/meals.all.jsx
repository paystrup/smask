import { useLoaderData } from "@remix-run/react";
import { Search } from "lucide-react";
import mongoose from "mongoose";
import MealCard from "~/_components/cards/MealCard";
import { Input } from "~/components/ui/input";

export async function loader() {
  const meals = await mongoose.models.Meal.find().populate("tags");
  return meals;
}

export default function Meals() {
  const meals = useLoaderData();

  return (
    <section className="mt-8">
      <div className="flex items-center justify-center text-center flex-col gap-12">
        <h1 className="text-5xl font-medium tracking-tighter max-w-[25ch]">
          Search for delicious meals in your Smask library
        </h1>

        <div className="relative w-full max-w-4xl">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search" className="pl-8" />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="m-3 mt-8 text-2xl font-bold tracking-tight">
          All meals {"(" + meals?.length + ")"}
        </h2>

        <ul className="grid grid-cols-12 gap-8">
          {meals &&
            meals.map((meal) => {
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
      </div>
    </section>
  );
}
